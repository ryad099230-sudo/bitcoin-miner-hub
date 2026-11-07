import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/fees")({
  head: () => ({
    meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, 
      { title: "Fees and Withdrawal Policy — Nova Invest" },
      { name: "description", content: "Withdrawal fees, minimums, and processing policy." },
      { property: "og:title", content: "Fees and Withdrawal Policy — Nova Invest" },
      { property: "og:description", content: "Withdrawal fees, minimums, and processing policy." },
    ],
  }),
  component: () => <InfoPage page="fees" />,
});
