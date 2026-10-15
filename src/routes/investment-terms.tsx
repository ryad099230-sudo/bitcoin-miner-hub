import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/investment-terms")({
  head: () => ({
    meta: [
      { title: "Investment Terms — Bitcoin Mining Investment" },
      { name: "description", content: "Minimums, eligibility, and how distributions are determined." },
      { property: "og:title", content: "Investment Terms — Bitcoin Mining Investment" },
      { property: "og:description", content: "Minimums, eligibility, and how distributions are determined." },
    ],
  }),
  component: () => <InfoPage page="invest" />,
});
