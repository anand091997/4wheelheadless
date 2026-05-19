import { getCmsBlockByIdentifier } from "@/framework/graphql";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

type FooterProps = {
  storeCopyright?: string | null;
};

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": "\u00a0",
  };

  return value
    .replace(/&(lt|gt|amp|quot|#39|nbsp);/g, (entity) => namedEntities[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
}

export default async function Footer({ storeCopyright }: FooterProps) {
  try {
    const [block, bottomBlock] = await Promise.all([
      getCmsBlockByIdentifier("footer_content"),
      getCmsBlockByIdentifier("footer_bottom"),
    ]);

    if (!block?.content && !storeCopyright) {
      return null;
    }

    return (
      <footer>
        <NewsletterSubscribe />
        {block?.content ? (
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(block.content) }} />
        ) : null}
        <div className="bg-black">
          <div className="text-[#d2d2d2] flex justify-between container pt-5 pb-7 border-t border-t-[#51565B] max-md:flex-col max-md:gap-y-4 max-md:items-center">
            {storeCopyright ? (
              <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(storeCopyright) }} />
            ) : null}
            {bottomBlock?.content ? (
              <div className="lg:w-[60%]" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(bottomBlock.content) }} />
            ) : null}
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error("Failed to load footer data", error);
    return null;
  }
}
