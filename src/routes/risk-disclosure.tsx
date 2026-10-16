import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/risk-disclosure")({
  head: () => ({
    meta: [
      { title: "Risk Disclosure — Nova Invest" },
      { name: "description", content: "Capital, market, liquidity, and regulatory risks of mining investment." },
      { property: "og:title", content: "Risk Disclosure — Nova Invest" },
      { property: "og:description", content: "Capital, market, liquidity, and regulatory risks of mining investment." },
    ],
  }),
  component: () => <InfoPage page="risk" />,
});
