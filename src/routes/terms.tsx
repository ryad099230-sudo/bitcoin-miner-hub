import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Bitcoin Mining Investment" },
      { name: "description", content: "Terms governing use of the Bitcoin Mining Investment platform." },
      { property: "og:title", content: "Terms of Service — Bitcoin Mining Investment" },
      { property: "og:description", content: "Terms governing use of the Bitcoin Mining Investment platform." },
    ],
  }),
  component: () => <InfoPage page="terms" />,
});
