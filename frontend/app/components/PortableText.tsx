"use client";

import {
  PortableText as PortableTextReact,
  type PortableTextComponents,
  type PortableTextProps as PortableTextReactProps,
} from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    h2: ({ children }) => (
      <h2 className="text-2xl font-medium mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-current pl-4 italic my-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const target = value?.openInNewTab ? "_blank" : undefined;
      const rel = value?.openInNewTab ? "noopener noreferrer" : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="underline hover:opacity-60 transition-opacity"
        >
          {children}
        </a>
      );
    },
  },
};

type PortableTextProps = {
  value: PortableTextReactProps["value"] | null | undefined;
  className?: string;
};

export function PortableText({ value, className }: PortableTextProps) {
  if (!value) return null;

  return (
    <div className={className}>
      <PortableTextReact value={value} components={components} />
    </div>
  );
}
