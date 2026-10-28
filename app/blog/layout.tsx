import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": "/blog/rss.xml",
    },
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
