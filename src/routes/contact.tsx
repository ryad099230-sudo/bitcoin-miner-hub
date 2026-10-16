import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact and Support — Nova Invest" },
      { name: "description", content: "How to reach support about your account, deposits, and withdrawals." },
      { property: "og:title", content: "Contact and Support — Nova Invest" },
      { property: "og:description", content: "How to reach support about your account, deposits, and withdrawals." },
    ],
  }),
  component: () => <InfoPage page="contact" />,
});
