#!/usr/bin/env bash
# Deploys the API to AWS (Lambda + API Gateway + RDS MySQL), then applies migrations and the seed.
# Safe to run again: it updates the stack in place.
#
# Needs: AWS CLI v2 and AWS SAM CLI, logged in to your account (`aws configure` or `aws sso login`).
# Reads ADMIN_EMAIL, ADMIN_PASSWORD_HASH and JWT_SECRET (and optionally RESEND_API_KEY, CONTACT_TO_EMAIL,
# CONTACT_FROM_EMAIL) from the environment, or from the repo's .env if not set. CORS_ORIGINS_AWS sets the
# website origins allowed to call the API (default: the live site); .env's CORS_ORIGINS is for localhost.
#
#   AWS_REGION=ap-south-1 ./deploy/aws/deploy.sh
set -euo pipefail

STACK=${STACK:-portfolio-api}
REGION=${AWS_REGION:-$(aws configure get region || true)}
REPO=$(cd "$(dirname "$0")/../.." && pwd)
: "${REGION:?Set AWS_REGION}"
cd "$REPO"

# Fill in anything not already exported from .env, without overriding what is.
if [[ -f "$REPO/.env" ]]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* || -n "${!key:-}" ]] && continue
    value=${value%\'}; value=${value#\'}
    export "$key=$value"
  done < "$REPO/.env"
fi
: "${ADMIN_EMAIL:?}" "${ADMIN_PASSWORD_HASH:?}" "${JWT_SECRET:?}"

echo "==> Building the Lambda bundle"
npm run build:lambda -w apps/api

echo "==> Finding the default VPC in $REGION"
VPC=$(aws ec2 describe-vpcs --region "$REGION" --filters Name=is-default,Values=true \
  --query 'Vpcs[0].VpcId' --output text)
[[ "$VPC" == "None" ]] && { echo "No default VPC in $REGION. Create one: aws ec2 create-default-vpc"; exit 1; }
SUBNETS=$(aws ec2 describe-subnets --region "$REGION" --filters Name=vpc-id,Values="$VPC" \
  --query 'Subnets[].SubnetId' --output text | tr '\t' ',')

echo "==> Deploying stack $STACK (the first run creates the database: about 10 minutes)"
sam deploy \
  --template-file "$REPO/deploy/aws/template.yaml" \
  --stack-name "$STACK" --region "$REGION" \
  --resolve-s3 --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset \
  --parameter-overrides \
    "VpcId=$VPC" "SubnetIds=$SUBNETS" \
    "AdminEmail=$ADMIN_EMAIL" "AdminPasswordHash=$ADMIN_PASSWORD_HASH" "JwtSecret=$JWT_SECRET" \
    "CorsOrigins=${CORS_ORIGINS_AWS:-https://prathameshpatil.vercel.app}" \
    "ResendApiKey=${RESEND_API_KEY:-}" "ContactToEmail=${CONTACT_TO_EMAIL:-}" "ContactFromEmail=${CONTACT_FROM_EMAIL:-}"

output() {
  aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}
API_URL=$(output ApiUrl)
DB_HOST=$(output DatabaseHost)
DB_PASSWORD=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id "$(output DbSecretArn)" \
  --query SecretString --output text | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).password')

# The Lambda bundle doesn't carry the SQL files, so migrations run from here, over TLS.
echo "==> Applying migrations and the seed"
export DATABASE_URL="mysql://portfolio:$DB_PASSWORD@$DB_HOST:3306/portfolio?ssl=Amazon%20RDS"
npm run db:migrate -w apps/api
npm run db:seed -w apps/api

echo "==> Checking $API_URL/health"
curl -fsS "$API_URL/health" && echo
echo
echo "API:  $API_URL"
echo "Docs: $API_URL/docs"
