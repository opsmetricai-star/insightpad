import Link from "next/link";
import { getCtx } from "@/lib/session";
import { Empty, PageTitle, fmtDate } from "@/components/app-ui";
import { ActionForm } from "@/components/Forms";
import { deleteDataset, uploadDataset } from "@/lib/actions";

export const metadata = { title: "Datasets" };

export default async function Datasets() {
  const c = await getCtx();
  const { data: list } = await c.supabase.from("datasets").select("id, name, filename, row_count, truncated, columns, created_at").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false });
  return (
    <>
      <PageTitle title="Datasets" sub={`Upload CSV files. Your ${c.plan.name} plan keeps up to ${c.plan.limits.rows.toLocaleString()} rows per dataset and ${c.plan.limits.datasets} datasets.`} />
      <section className="card mb-8 p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Upload a CSV</h2>
        <ActionForm action={uploadDataset} submit="Upload dataset" className="grid max-w-xl gap-4" success="Dataset uploaded.">
          <label className="grid gap-1.5 text-sm font-medium">Name (optional)<input name="name" className="field" placeholder="Q3 sales" /></label>
          <label className="grid gap-1.5 text-sm font-medium">CSV file<input type="file" name="file" accept=".csv,.tsv,.txt,text/csv" required className="field" /></label>
        </ActionForm>
      </section>
      {list?.length ? (
        <div className="card divide-y divide-line">
          {list.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <Link href={`/app/datasets/${d.id}`} className="font-display text-lg font-medium underline-offset-2 hover:underline">{d.name}</Link>
                <p className="mt-0.5 text-sm text-ink-soft">{d.row_count.toLocaleString()} rows · {(d.columns as unknown[]).length} columns{d.truncated ? " · truncated to plan limit" : ""} · {fmtDate(d.created_at)}</p>
              </div>
              <form action={async () => { "use server"; await deleteDataset(d.id); }}><button className="text-sm text-red-600 underline">Delete</button></form>
            </div>
          ))}
        </div>
      ) : <Empty title="No datasets yet" body="Upload a CSV to start asking questions. The first row must contain column names." />}
    </>
  );
}
