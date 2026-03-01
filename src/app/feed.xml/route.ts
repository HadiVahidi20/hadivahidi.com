import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hadivahidi.com";

export async function GET() {
  let articleData: { title: string; slug: string; excerpt: string | null; publishedAt: Date | null }[] = [];

  try {
    articleData = await db.query.articles.findMany({
      where: eq(articles.status, "published"),
      columns: { title: true, slug: true, excerpt: true, publishedAt: true },
      orderBy: [desc(articles.publishedAt)],
      limit: 20,
    });
  } catch {
    // DB not available
  }

  const items = articleData
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${BASE_URL}/articles/${a.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/articles/${a.slug}</guid>
      ${a.excerpt ? `<description><![CDATA[${a.excerpt}]]></description>` : ""}
      ${a.publishedAt ? `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>` : ""}
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hadi Vahidi - Articles</title>
    <link>${BASE_URL}</link>
    <description>Thoughts on web development, design, and technology by Hadi Vahidi.</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
