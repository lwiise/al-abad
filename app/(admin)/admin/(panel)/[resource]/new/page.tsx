import { notFound } from "next/navigation";
import { getResource } from "../../../_lib/resources";
import { ResourceForm } from "../../_components/resource-form";

export default async function NewResourcePage(props: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await props.params;
  const resource = getResource(key);
  if (!resource) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{resource.singular} جديد</h1>
      <ResourceForm resource={resource} />
    </>
  );
}
