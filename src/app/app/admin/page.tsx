import { notFound } from "next/navigation";
import { getCtx } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/server";
import { Empty, PageTitle, fmtDate } from "@/components/app-ui";
import { reviewClaim } from "@/lib/actions";

export const metadata = { title: "Admin" };

export default async function Admin() {
  const c = await getCtx();
  if (!c.isAdmin) notFound();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <PageTitle title="Admin" sub="Set SUPABASE_SERVICE_ROLE_KEY to review payments." />;
  const admin = createAdminClient();
  const { data: claims } = await admin.from("payment_claims").select("id, plan, reference, payer_email, status, created_at, workspace_id, reviewed_by").order("created_at", { ascending: false }).limit(100);
  return (
    <>
      <PageTitle title="Admin" sub="Verify each reference in your payment provider's dashboard before approving. Approving upgrades the workspace and resets its credits." />
      <h2 className="mb-3 font-display text-lg font-semibold">Payment claims</h2>
      {claims?.length ? (
        <div className="card divide-y divide-line">
          {claims.map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm">
              <div><p className="font-medium capitalize">{x.plan} · <span className="font-mono">{x.reference}</span></p><p className="text-ink-soft">{x.payer_email} · {fmtDate(x.created_at)} · {x.status}{x.reviewed_by ? ` by ${x.reviewed_by}` : ""}</p></div>
              {x.status === "pending" && (
                <form action={reviewClaim} className="flex gap-2"><input type="hidden" name="id" value={x.id} />
                  <button name="decision" value="approve" className="btn btn-sm btn-solid">Approve</button>
                  <button name="decision" value="reject" className="btn btn-sm">Reject</button>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : <Empty title="No claims" body="Submitted payment confirmations appear here." />}
    </>
  );
}
