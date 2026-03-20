import type { Metadata } from "next";

import Footer from "@/app/components/Footer";
import HomeButton from "@/app/components/HomeButton";
import { PortableText } from "@/app/components/PortableText";
import { sanityFetch } from "@/sanity/lib/live";
import { aboutQuery, settingsQuery } from "@/sanity/lib/queries";
import { resolveExternalLink } from "@/sanity/lib/utils";
import AnimatedStar from "@/app/components/AnimatedStar";
import AboutBackground from "./AboutBackground";

// Revalidate every hour (ISR)
export const revalidate = 3600;

type ExternalLinkItem = {
  _key: string;
  label: string | null;
  linkType: string | null;
  url: string | null;
  email: string | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const { data: about } = await sanityFetch({
    query: aboutQuery,
    stega: false,
  });

  return {
    title: about?.seoTitle || "About",
    description: about?.seoDescription,
  };
}

export default async function AboutPage() {
  const [{ data: about }, { data: settings }] = await Promise.all([
    sanityFetch({ query: aboutQuery }),
    sanityFetch({ query: settingsQuery }),
  ]);

  return (
    <AboutBackground defaultColor="#E72B1C">
      <HomeButton color="white" />

      {/* Main Text - Top */}
      <div className="relative z-10 p-2 pt-12 font-normal" style={{ fontFamily: "var(--font-outfit)" }}>
        {about?.mainText && (
          <PortableText
            value={about.mainText}
            className="text-[15px] text-justify"
          />
        )}
      </div>

      {/* Star + Clients + Press — absolutely centered in viewport */}
      <div className="absolute inset-0 flex items-center justify-center z-0 px-2 pt-16">
        <div className="relative">
          {/* Star */}
          <AnimatedStar className="w-[250px] min-[1100px]:w-[450px] h-auto" />

          {/* Selected Clients - Left, pinned to page left edge */}
          <div className="hidden min-[1100px]:block fixed left-2 top-[55%] max-w-[calc((100vw-450px)/2-4rem)] text-left">
            {about?.selectedClients && (
              <h2 className="text-[15px] font-medium tracking-wider">
                {about.selectedClients}
              </h2>
            )}
            {about?.selectedClientsDescription && (
              <p className="text-[15px] leading-relaxed">
                {about.selectedClientsDescription}
              </p>
            )}
          </div>

          {/* Press - Right, pinned to page right edge */}
          <div className="hidden min-[1100px]:block fixed right-2 top-[55%] max-w-[calc((100vw-450px)/2-1.5rem)] text-left">
            {(() => {
              const press = about?.press as unknown as string[] | null;
              return press?.length ? (
                <>
                  <h2 className="text-[15px] font-medium tracking-wider">
                    Press
                  </h2>
                  <p className="text-[15px] leading-relaxed">
                    {press.join(", ")}
                  </p>
                </>
              ) : null;
            })()}
          </div>

          {/* Contact - Below star */}
          {about?.contact && about.contact.length > 0 && (
            <div className="text-center mt-6">
              <ul>
                {about.contact.map((link: ExternalLinkItem) => {
                  const href = resolveExternalLink(link);
                  if (!href) return null;

                  return (
                    <li key={link._key}>
                      <a
                        href={href}
                        target={link.linkType === "external" ? "_blank" : undefined}
                        rel={link.linkType === "external" ? "noopener noreferrer" : undefined}
                        className="text-[15px] hover:opacity-60 transition-opacity">
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      {/* Footer */}
      <Footer
        leftText={settings?.footerLeftText}
        centerText={settings?.footerCenterText}
        rightText={settings?.footerRightText}
      />
    </AboutBackground>
  );
}
