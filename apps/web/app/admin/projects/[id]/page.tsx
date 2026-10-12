import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectForm";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  return <ProjectEditor id={id} />;
}
