import type { Metadata } from "next";

import Footer from "@/app/components/Footer";
import HomeButton from "@/app/components/HomeButton";
import { PortableText } from "@/app/components/PortableText";
import { sanityFetch } from "@/sanity/lib/live";
import { aboutQuery, settingsQuery } from "@/sanity/lib/queries";
import { resolveExternalLink } from "@/sanity/lib/utils";

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

  // Get background color from Sanity (color plugin returns { hex, rgb, hsl, etc. })
  const backgroundColor = about?.backgroundColor?.hex || undefined;

  return (
    <div
      className="min-h-screen flex flex-col lg:pt-24 pt-12"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <HomeButton />
      {/* Main Content */}
      <div className="flex-1 p-2 mx-auto pb-12">
        {/* Main Text */}
        {about?.mainText && (
          <PortableText
            value={about.mainText}
            className="text-[13px] min-[1100px]:text-sm text-justify leading-relaxed mb-12"
          />
        )}

        {/* Three Column Section: Selected Clients, Specialties, Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-24">
          {/* Selected Clients */}
          <div>
            {about?.selectedClients && (
              <h2 className="text-[13px] min-[1100px]:text-sm font-medium tracking-wider mb-2">
                {about.selectedClients}
              </h2>
            )}
            {about?.selectedClientsDescription && (
              <p className="text-[13px] min-[1100px]:text-sm leading-relaxed">
                {about.selectedClientsDescription}
              </p>
            )}
          </div>

          {/* Specialties */}
          <div>
            {about?.specialties && about.specialties.length > 0 && (
              <>
                <h2 className="text-[13px] min-[1100px]:text-sm font-medium tracking-wider mb-2">
                  Especialidades
                </h2>
                <ul className="space-y-1">
                  {about.specialties.map((specialty: string, index: number) => (
                    <li key={index} className="text-[13px] min-[1100px]:text-sm">
                      {specialty}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Contact */}
          <div>
            {about?.contact && about.contact.length > 0 && (
              <>
                <h2 className="text-[13px] min-[1100px]:text-sm font-medium tracking-wider mb-2">Contact</h2>
                <ul className="space-y-1">
                  {about.contact.map((link: ExternalLinkItem) => {
                    const href = resolveExternalLink(link);
                    if (!href) return null;

                    return (
                      <li key={link._key}>
                        <a
                          href={href}
                          target={link.linkType === "external" ? "_blank" : undefined}
                          rel={link.linkType === "external" ? "noopener noreferrer" : undefined}
                          className="text-[13px] min-[1100px]:text-sm hover:opacity-60 transition-opacity">
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        leftText={settings?.footerLeftText}
        centerText={settings?.footerCenterText}
        rightText={settings?.footerRightText}
      />
    </div>
  );
}
