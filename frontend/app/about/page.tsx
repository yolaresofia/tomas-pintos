import type { Metadata } from "next";

import Footer from "@/app/components/Footer";
import HomeButton from "@/app/components/HomeButton";
import { PortableText } from "@/app/components/PortableText";
import { sanityFetch } from "@/sanity/lib/live";
import { aboutQuery, settingsQuery } from "@/sanity/lib/queries";
import { resolveExternalLink } from "@/sanity/lib/utils";
import AnimatedStar from "@/app/components/AnimatedStar";
import AboutBackground from "../components/AboutBackground";

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
      <div
        className="relative z-10 p-2 pt-12 font-normal"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {about?.mainText && (
          <PortableText
            value={about.mainText}
            className="text-[15px] text-justify"
          />
        )}
      </div>

      {/* Mobile: Star + content in flow below text */}
      <div className="min-[1100px]:hidden flex flex-col items-start px-2 md:mt-8 pb-16">
        <AnimatedStar className="w-[300px] h-auto self-center" />

        {/* Selected Clients */}
        <div className="w-full mt-8">
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

        {/* Press */}
        {(() => {
          const press = about?.press as ExternalLinkItem[] | null;
          return press && press.length > 0 ? (
          <div className="w-full mt-8">
            <h2 className="text-[15px] font-medium tracking-wider">Press</h2>
            <ul>
              {press.map((link) => {
                const href = resolveExternalLink(link);
                if (!href) return null;
                return (
                  <li key={link._key}>
                    <a
                      href={href}
                      target={
                        link.linkType === "external" ? "_blank" : undefined
                      }
                      rel={
                        link.linkType === "external"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-[15px] hover:opacity-60 transition-opacity"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          ) : null;
        })()}

        {/* Contact */}
        {about?.contact && about.contact.length > 0 && (
          <div className="lg:text-center mt-8">
            <h2 className="text-[15px] lg:hidden block font-medium tracking-wider">
              Contact
            </h2>
            <ul>
              {about.contact.map((link: ExternalLinkItem) => {
                const href = resolveExternalLink(link);
                if (!href) return null;

                return (
                  <li key={link._key}>
                    <a
                      href={href}
                      target={
                        link.linkType === "external" ? "_blank" : undefined
                      }
                      rel={
                        link.linkType === "external"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-[15px] hover:opacity-60 transition-opacity"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Desktop: Star + Clients + Press — absolutely centered in viewport */}
      <div className="hidden min-[1100px]:flex absolute inset-0 items-center justify-center z-0 px-2 pt-16">
        <div className="relative">
          <AnimatedStar className="w-[450px] h-auto" />

          {/* Selected Clients - Left, pinned to page left edge */}
          <div className="fixed left-2 top-[55%] w-[calc((100vw-450px)/2-4rem)] text-left">
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
          <div className="fixed right-2 top-[55%] w-[calc((100vw-450px)/2-4rem)] text-left">
            {(() => {
              const press = about?.press as ExternalLinkItem[] | null;
              return press && press.length > 0 ? (
              <>
                <h2 className="text-[15px] font-medium tracking-wider">
                  Press
                </h2>
                <p className="text-[15px] leading-relaxed">
                  {press.map((link, i) => {
                    const href = resolveExternalLink(link);
                    if (!href) return null;
                    return (
                      <span key={link._key}>
                        {i > 0 && ", "}
                        <a
                          href={href}
                          target={
                            link.linkType === "external" ? "_blank" : undefined
                          }
                          rel={
                            link.linkType === "external"
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:opacity-60 transition-opacity"
                        >
                          {link.label}
                        </a>
                      </span>
                    );
                  })}
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
                        target={
                          link.linkType === "external" ? "_blank" : undefined
                        }
                        rel={
                          link.linkType === "external"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-[15px] hover:opacity-60 transition-opacity"
                      >
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
