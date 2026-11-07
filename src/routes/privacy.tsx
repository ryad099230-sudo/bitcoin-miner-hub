import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, 
      { title: "Privacy Policy — Nova Invest" },
      { name: "description", content: "How account and transaction data is collected and protected." },
      { property: "og:title", content: "Privacy Policy — Nova Invest" },
      { property: "og:description", content: "How account and transaction data is collected and protected." },
    ],
  }),
  component: () => <InfoPage page="privacy" />,
});
