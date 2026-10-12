import { notFound } from "next/navigation";
import { PublicationEditor } from "@/components/admin/PublicationForm";

export const metadata = { title: "Edit publication" };

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  return <PublicationEditor id={id} />;
}
