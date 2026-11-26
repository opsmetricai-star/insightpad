import ContentPage from "@/components/ContentPage";
import { pages } from "@/content/site";
export const metadata = { title: "Enterprise", description: pages["enterprise"].lead };
export default function Page() { return <ContentPage def={pages["enterprise"]} />; }
