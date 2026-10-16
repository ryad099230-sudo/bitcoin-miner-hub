import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nova Invest" },
      { name: "description", content: "How account and transaction data is collected and protected." },
      { property: "og:title", content: "Privacy Policy — Nova Invest" },
      { property: "og:description", content: "How account and transaction data is collected and protected." },
    ],
  }),
  component: () => <InfoPage page="privacy" />,
});
