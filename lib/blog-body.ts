export type BlogBlock =
  | { type: "h2" | "h3"; id: string; text: string }
  | { type: "p"; html: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; html: string; source?: string }
  | { type: "code"; text: string };

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function inline(value: string) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => {
    const decoded = href.replaceAll("&amp;", "&");
    const safe =
      (decoded.startsWith("/") && !decoded.startsWith("//")) ||
      decoded.startsWith("https://") ||
      decoded.startsWith("http://") ||
      decoded.startsWith("mailto:");
    if (!safe) return label;
    const external = decoded.startsWith("http");
    const rel = external ? ' rel="noopener noreferrer"' : "";
    const target = external ? ' target="_blank"' : "";
    return `<a href="${escapeHtml(decoded)}"${target}${rel}>${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return html;
}

export function headingId(text: string) {
  const base = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "seccion";
}

function isBlockStart(line: string) {
  const trimmed = line.trim();
  return trimmed.startsWith("```") || trimmed.startsWith(">") || /^#{1,3}\s+/.test(trimmed) || /^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
}

export function parseBlocks(source: string): BlogBlock[] {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const blocks: BlogBlock[] = [];
  const used = new Map<string, number>();
  let index = 0;

  const nextId = (text: string) => {
    const base = headingId(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (!line.trim() || /^---+$/.test(line.trim())) {
      index += 1;
      continue;
    }
    if (line.trim().startsWith("```")) {
      const buffer: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").trim().startsWith("```")) {
        buffer.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", text: buffer.join("\n") });
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (heading) {
      const level = heading[1].length >= 3 ? "h3" : "h2";
      const text = heading[2].trim();
      blocks.push({ type: level, id: nextId(text), text });
      index += 1;
      continue;
    }
    if (line.trim().startsWith(">")) {
      const buffer: string[] = [];
      while (index < lines.length && (lines[index] ?? "").trim().startsWith(">")) {
        buffer.push((lines[index] ?? "").trim().replace(/^>\s?/, ""));
        index += 1;
      }
      const sourceAt = buffer.findIndex((item) => /^fuente:/i.test(item));
      if (sourceAt >= 0) {
        blocks.push({
          type: "quote",
          html: inline(buffer.slice(0, sourceAt).join(" ")),
          source: inline(buffer.slice(sourceAt).join(" ")),
        });
      } else {
        blocks.push({ type: "quote", html: inline(buffer.join(" ")) });
      }
      continue;
    }
    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test((lines[index] ?? "").trim())) {
        items.push(inline((lines[index] ?? "").trim().replace(/^[-*]\s+/, "")));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test((lines[index] ?? "").trim())) {
        items.push(inline((lines[index] ?? "").trim().replace(/^\d+\.\s+/, "")));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    const buffer = [line.trim()];
    index += 1;
    while (index < lines.length && (lines[index] ?? "").trim() && !isBlockStart(lines[index] ?? "")) {
      buffer.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({ type: "p", html: inline(buffer.join(" ")) });
  }

  return blocks;
}

function blockText(block: BlogBlock) {
  switch (block.type) {
    case "h2":
    case "h3":
    case "code":
      return block.text;
    case "p":
      return block.html;
    case "quote":
      return `${block.html} ${block.source ?? ""}`;
    case "ul":
    case "ol":
      return block.items.join(" ");
  }
}

function wordCount(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Parte el cuerpo después del bloque que cruza la mitad de las palabras. */
export function splitForCta(blocks: BlogBlock[]) {
  const counts = blocks.map((block) => wordCount(blockText(block)));
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (!blocks.length || !total) return { before: blocks, after: [] as BlogBlock[] };
  const half = total / 2;
  let seen = 0;
  let cut = blocks.length - 1;
  for (let index = 0; index < counts.length; index += 1) {
    seen += counts[index] ?? 0;
    if (seen >= half) {
      cut = index;
      break;
    }
  }
  return { before: blocks.slice(0, cut + 1), after: blocks.slice(cut + 1) };
}
