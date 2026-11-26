import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Sign up" };
export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const sp = await searchParams;
  const plan = ["professional", "team", "enterprise"].includes(sp.plan ?? "") ? sp.plan : undefined;
  return <AuthForm mode="signup" plan={plan} />;
}
