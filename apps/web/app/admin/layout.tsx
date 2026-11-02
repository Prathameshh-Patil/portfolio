import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/AdminShell";
import { Container } from "@/components/ui/Container";

// noindex: admin pages should never appear in search results, even though this site isn't public.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <AdminShell>{children}</AdminShell>
    </Container>
  );
}
