import createImageUrlBuilder from "@sanity/image-url";
import { dataset, projectId, studioUrl } from "@/sanity/lib/api";
import { createDataAttribute, CreateDataAttributeProps } from "next-sanity";
import { getImageDimensions } from "@sanity/asset-utils";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

export const urlForImage = (source: any) => {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined;
  }

  const imageRef = source?.asset?._ref;
  const crop = source.crop;

  // get the image's og dimensions
  const { width, height } = getImageDimensions(imageRef);

  if (Boolean(crop)) {
    // compute the cropped image's area
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)));

    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)));

    // compute the cropped image's position
    const left = Math.floor(width * crop.left);
    const top = Math.floor(height * crop.top);

    // gather into a url
    return imageBuilder
      ?.image(source)
      .rect(left, top, croppedWidth, croppedHeight)
      .auto("format");
  }

  return imageBuilder?.image(source).auto("format");
};

export function resolveOpenGraphImage(image: any, width = 1200, height = 627) {
  if (!image) return;
  const url = urlForImage(image)?.width(1200).height(627).fit("crop").url();
  if (!url) return;
  return { url, alt: image?.alt as string, width, height };
}

/**
 * Get the URL path for a project based on its category
 */
export function getProjectPath(category: string, slug: string): string {
  const categoryPaths: Record<string, string> = {
    "foto-selected-works": "foto/selected-works",
    "foto-editorial": "foto/editorial",
    "movement-direction": "movement-direction",
    "performance": "performance",
  };

  const basePath = categoryPaths[category] || "";
  return basePath ? `/${basePath}/${slug}` : `/${slug}`;
}

/**
 * Resolve external link to URL
 */
export function resolveExternalLink(link: {
  linkType?: string | null;
  url?: string | null;
  email?: string | null;
} | null): string | null {
  if (!link) return null;

  if (link.linkType === "email" && link.email) {
    return `mailto:${link.email}`;
  }

  if (link.linkType === "external" && link.url) {
    return link.url;
  }

  return null;
}

type DataAttributeConfig = CreateDataAttributeProps &
  Required<Pick<CreateDataAttributeProps, "id" | "type" | "path">>;

export function dataAttr(config: DataAttributeConfig) {
  return createDataAttribute({
    projectId,
    dataset,
    baseUrl: studioUrl,
  }).combine(config);
}
