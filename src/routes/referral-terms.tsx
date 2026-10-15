import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/referral-terms")({
  head: () => ({
    meta: [
      { title: "Referral Program Terms — Bitcoin Mining Investment" },
      { name: "description", content: "Single-level 1% referral commission terms." },
      { property: "og:title", content: "Referral Program Terms — Bitcoin Mining Investment" },
      { property: "og:description", content: "Single-level 1% referral commission terms." },
    ],
  }),
  component: () => <InfoPage page="referral" />,
});
