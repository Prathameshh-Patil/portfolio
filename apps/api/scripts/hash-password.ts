import bcrypt from "bcryptjs";

// Usage: npm run hash-password -- "your-password"
// Paste the output into ADMIN_PASSWORD_HASH in .env (wrap it in single quotes; it contains $ signs).
const password = process.argv[2];
if (!password || password.length < 12) {
  console.error("Give a password of at least 12 characters");
  process.exit(1);
}
console.log(await bcrypt.hash(password, 12));
