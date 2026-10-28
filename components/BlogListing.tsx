import { cacheLife } from "next/cache";
import { BlogIndexView } from "@/components/BlogIndexView";
import { selectPosts } from "@/lib/blog";
import type { BlogCategory } from "@/lib/blog-schema";
import { getReferenceDate } from "@/lib/dates";

export async function BlogListing({ category }: { category: BlogCategory | null }) {
  "use cache";
  cacheLife({ revalidate: 86400 });
  const today = await getReferenceDate();
  const posts = selectPosts(today, process.env.NODE_ENV !== "production");
  const visible = category ? posts.filter((post) => post.category === category) : posts;
  return <BlogIndexView posts={visible} active={category} today={today} />;
}
