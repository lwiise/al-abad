import { notFound } from "next/navigation";
import { getResource } from "../../../_lib/resources";
import { adminDb } from "../../../_lib/db";
import { ResourceForm } from "../../_components/resource-form";

export default async function EditResourcePage(props: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await props.params;
  const resource = getResource(key);
  if (!resource) notFound();

  const { data } = await adminDb()
    .from(resource.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-foreground">تحرير {resource.singular}</h1>
      <ResourceForm resource={resource} record={data as Record<string, unknown>} />
    </>
  );
}
