import { sanityFetch } from "@/sanity/lib/live";
import { settingsQuery } from "@/sanity/lib/queries";
import IntroClient from "./IntroClient";

export const revalidate = 3600;

export default async function IntroPage() {
  const { data: settings } = await sanityFetch({ query: settingsQuery });

  return (
    <IntroClient
      leftText={settings?.footerLeftText || "TOMAS"}
      rightText={settings?.footerRightText || "PINTOS"}
    />
  );
}
