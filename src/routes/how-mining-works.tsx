import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/how-mining-works")({
  head: () => ({
    meta: [
      { title: "How Bitcoin Mining Works — Bitcoin Mining Investment" },
      { name: "description", content: "Learn how Bitcoin mining works, what drives revenue, and why returns fluctuate." },
      { property: "og:title", content: "How Bitcoin Mining Works — Bitcoin Mining Investment" },
      { property: "og:description", content: "Learn how Bitcoin mining works, what drives revenue, and why returns fluctuate." },
    ],
  }),
  component: () => <InfoPage page="how" />,
});
