function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value: string) {
  const linked = escapeHtml(value).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    const safe = href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://") || href.startsWith("mailto:");
    if (!safe) return label;
    const external = href.startsWith("http");
    const rel = external ? ' rel="noopener noreferrer"' : "";
    const target = external ? ' target="_blank"' : "";
    return `<a href="${href}"${target}${rel}>${label}</a>`;
  });
  return linked.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function markdownToHtml(source: string) {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let list: "ul" | "ol" | null = null;

  const closeList = () => {
    if (!list) return;
    html.push(list === "ul" ? "</ul>" : "</ol>");
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeList();
      const level = heading[1].length + 1;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      closeList();
      html.push(`<blockquote><p>${inline(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }
    const unordered = /^[-*]\s+(.+)$/.exec(trimmed);
    if (unordered) {
      if (list !== "ul") {
        closeList();
        html.push("<ul>");
        list = "ul";
      }
      html.push(`<li>${inline(unordered[1])}</li>`);
      continue;
    }
    const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (ordered) {
      if (list !== "ol") {
        closeList();
        html.push("<ol>");
        list = "ol";
      }
      html.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(trimmed)}</p>`);
  }
  closeList();
  return html.join("");
}

export function Markdown({ source }: { source: string }) {
  return <div className="prose-mc" dangerouslySetInnerHTML={{ __html: markdownToHtml(source) }} />;
}
