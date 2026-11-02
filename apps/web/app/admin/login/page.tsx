import { Suspense } from "react";
import { LoginForm } from "@/features/admin/LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  // Suspense: LoginForm reads the URL's query string (?expired=1) with useSearchParams.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
