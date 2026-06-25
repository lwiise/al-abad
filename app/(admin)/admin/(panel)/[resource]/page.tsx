import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";
import { getResource } from "../../_lib/resources";
import { adminDb } from "../../_lib/db";
import { ResourceTable } from "../_components/resource-table";

export default async function ResourceListPage(props: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await props.params;
  const resource = getResource(key);
  if (!resource) notFound();

  const { data } = await adminDb()
    .from(resource.table)
    .select("*")
    .order(resource.orderBy.column, { ascending: resource.orderBy.ascending });
  const rows = (data ?? []) as Record<string, unknown>[];

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{resource.label}</h1>
          <p className="text-sm text-foreground-muted">{rows.length} عنصر</p>
        </div>
        <Link href={`/admin/${resource.key}/new`} className={buttonClasses("primary", "sm")}>
          + {resource.singular} جديد
        </Link>
      </header>

      <ResourceTable resource={resource} rows={rows} />
    </>
  );
}
