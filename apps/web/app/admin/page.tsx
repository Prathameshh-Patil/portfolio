import { Dashboard } from "@/features/admin/Dashboard";

// "absolute": the admin layout's title template only applies to child pages, not this one in the same folder.
export const metadata = { title: { absolute: "Dashboard · Admin" } };

export default function AdminPage() {
  return <Dashboard />;
}
