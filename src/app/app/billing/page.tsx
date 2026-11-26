import { getCtx } from "@/lib/session";
import { PageTitle, fmtDate } from "@/components/app-ui";
import { ActionForm } from "@/components/Forms";
import { submitClaim } from "@/lib/actions";
import { plans } from "@/content/site";
import { Icon } from "@/components/ui";

export const metadata = { title: "Billing" };

export default async function Billing({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const sp = await searchParams;
  const c = await getCtx();
  const { data: claims } = await c.supabase.from("payment_claims").select("id, plan, reference, status, created_at").eq("workspace_id", c.workspace.id).order("created_at", { ascending: false });
  const paid = plans.filter((p) => p.payLink);
  const pending = claims?.some((x) => x.status === "pending");
  return (
    <>
      <PageTitle title="Billing" sub="Your plan, credits and upgrades." />
      <section className="card mb-8 grid gap-6 p-6 md:grid-cols-3">
        <div><p className="tag-label text-ink-soft">Current plan</p><p className="mt-2 font-display text-3xl font-semibold">{c.plan.name}</p><p className="text-sm text-ink-soft">Status: {c.sub.status}{c.sub.period_end ? ` · renews by ${new Date(c.sub.period_end).toLocaleDateString()}` : ""}</p></div>
        <div><p className="tag-label text-ink-soft">Credits</p><p className="mt-2 font-display text-3xl font-semibold">{(c.sub.credits_total - c.sub.credits_used).toLocaleString()} <span className="text-base font-normal text-ink-soft">of {c.sub.credits_total.toLocaleString()} left</span></p></div>
        <div><p className="tag-label text-ink-soft">Limits</p><p className="mt-2 text-sm">{c.plan.limits.datasets} datasets · {c.plan.limits.rows.toLocaleString()} rows each · {c.plan.limits.apps >= 9999 ? "unlimited" : c.plan.limits.apps} published apps</p></div>
      </section>

      <h2 className="mb-3 font-display text-xl font-semibold">Upgrade</h2>
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        {paid.map((p) => {
          const current = p.id === c.plan.id;
          return (
            <div key={p.id} className={`card flex flex-col p-6 ${sp.plan === p.id ? "ring-2 ring-violet" : ""}`}>
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className="mt-1 font-display text-3xl font-semibold">{p.price}<span className="ml-1 text-sm font-normal text-ink-soft">{p.unit}</span></p>
              <p className="mt-3 text-sm text-ink-soft">{p.blurb}</p>
              <ul className="my-5 flex-1 space-y-2 text-sm"><li className="flex gap-2"><Icon name="check" size={15} />{p.limits.aiCredits.toLocaleString()} AI credits / month</li>{p.features.slice(0, 5).map((f) => <li key={f} className="flex gap-2"><Icon name="check" size={15} />{f}</li>)}</ul>
              {current ? <span className="btn btn-sm w-full cursor-default opacity-60">Current plan</span> : <a href={p.payLink} target="_blank" rel="noopener noreferrer" className="btn btn-solid btn-sm w-full">Pay for {p.name}</a>}
            </div>
          );
        })}
      </div>

      <section className="card mb-8 max-w-2xl p-6">
        <h2 className="font-display text-lg font-semibold">Already paid? Confirm your payment</h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">After checkout, enter the order or transaction reference from your receipt. An administrator verifies it with the payment provider and activates your plan. Returning from checkout alone does not change your plan.</p>
        {pending && <p role="status" className="mb-4 border border-line bg-paper p-3 text-sm">You have a payment waiting for verification.</p>}
        <ActionForm action={submitClaim} submit="Submit for verification" className="grid gap-4" success="Submitted. You will be notified once it is verified.">
          <label className="grid gap-1.5 text-sm font-medium">Plan paid for
            <select name="plan" required defaultValue={sp.plan && paid.some((p) => p.id === sp.plan) ? sp.plan : ""} className="field"><option value="">Choose…</option>{paid.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.price})</option>)}</select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">Order / transaction reference<input name="reference" required minLength={4} className="field" /></label>
          <label className="grid gap-1.5 text-sm font-medium">Email used at checkout (optional)<input name="payer_email" type="email" className="field" /></label>
        </ActionForm>
      </section>

      {claims && claims.length > 0 && (
        <>
          <h2 className="mb-3 font-display text-lg font-semibold">Payment history</h2>
          <div className="card divide-y divide-line">
            {claims.map((x) => <div key={x.id} className="flex flex-wrap justify-between gap-3 px-5 py-3 text-sm"><span className="capitalize">{x.plan} · <span className="font-mono">{x.reference}</span></span><span className="text-ink-soft">{fmtDate(x.created_at)} · <b className={x.status === "approved" ? "text-mint" : x.status === "rejected" ? "text-red-600" : ""}>{x.status}</b></span></div>)}
          </div>
        </>
      )}
    </>
  );
}
