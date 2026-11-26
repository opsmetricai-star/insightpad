import Link from "next/link";
import { SimplePage } from "@/components/Simple";

export default function NotFound() {
  return (
    <SimplePage title="Page not" italic="found" lead="The page you are looking for has moved or never existed." cta={false}>
      <Link className="btn" href="/">Back home</Link>
    </SimplePage>
  );
}
