import AuthForm from "@/components/AuthForm";
export const metadata = { title: "Log in" };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return <AuthForm mode="login" next={sp.next} notice={sp.error === "link" ? "That link has expired or was already used. Request a new one." : undefined} />;
}
