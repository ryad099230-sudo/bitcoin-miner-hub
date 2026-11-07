import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/investment-terms")({
  head: () => ({
    meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, 
      { title: "Investment Terms — Nova Invest" },
      { name: "description", content: "Minimums, eligibility, and how distributions are determined." },
      { property: "og:title", content: "Investment Terms — Nova Invest" },
      { property: "og:description", content: "Minimums, eligibility, and how distributions are determined." },
    ],
  }),
  component: () => <InfoPage page="invest" />,
});
