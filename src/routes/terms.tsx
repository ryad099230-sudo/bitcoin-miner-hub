import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nova Invest" },
      { name: "description", content: "Terms governing use of the Nova Invest platform." },
      { property: "og:title", content: "Terms of Service — Nova Invest" },
      { property: "og:description", content: "Terms governing use of the Nova Invest platform." },
    ],
  }),
  component: () => <InfoPage page="terms" />,
});
