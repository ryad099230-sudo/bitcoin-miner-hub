import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/mining-operations")({
  head: () => ({
    meta: [
      { title: "Mining Operations — Nova Invest" },
      { name: "description", content: "How mining operations, costs, and distributions are recorded and reported." },
      { property: "og:title", content: "Mining Operations — Nova Invest" },
      { property: "og:description", content: "How mining operations, costs, and distributions are recorded and reported." },
    ],
  }),
  component: () => <InfoPage page="ops" />,
});
