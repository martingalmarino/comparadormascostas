import assert from "node:assert/strict";
import test from "node:test";
import { parseBlocks, splitForCta } from "@/lib/blog-body";
import { assertNoLoosePrice, isPublic, loadPosts, parseFrontmatter, readingMinutes, rssXml, selectPosts } from "@/lib/blog";

const base = {
  title: "Título de prueba",
  description: "Bajada corta de la guía de prueba para el esquema.",
  date: "2026-11-03",
  category: "Cuidados",
  keywords: ["calor"],
  author: "Cuidalo",
  faq: [{ q: "¿Pregunta?", a: "Respuesta." }],
  sources: [{ title: "Fuente", url: "https://example.com/fuente" }],
};

test("un frontmatter sin fuentes falla nombrando el archivo y el campo", () => {
  const { sources: _sources, ...rest } = base;
  assert.throws(() => parseFrontmatter("sin-fuentes.md", rest), /content\/blog\/sin-fuentes\.md inválido: sources: falta/);
});

test("la bajada no puede pasar de 160 caracteres", () => {
  assert.throws(() => parseFrontmatter("largo.md", { ...base, description: "a".repeat(161) }), /description: tiene más de 160 caracteres/);
});

test("el borrador y la fecha futura no se publican", () => {
  const posts = loadPosts();
  const post = posts.find((item) => item.slug === "golpe-de-calor-en-perros");
  assert.ok(post);
  assert.equal(post.draft, true);
  assert.equal(post.title, "Golpe de calor en perros: síntomas, qué hacer y cuándo ir a la guardia");
  assert.equal(isPublic(post, "2026-10-27"), false);
  assert.equal(isPublic({ ...post, draft: false }, "2026-10-27"), false);
  assert.equal(isPublic({ ...post, draft: false }, "2026-11-03"), true);
  assert.equal(selectPosts("2026-10-27", false).some((item) => item.slug === post.slug), false);
});

test("el tiempo de lectura sale del texto", () => {
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes(Array.from({ length: 200 }, () => "palabra").join(" ")), 1);
  assert.equal(readingMinutes(Array.from({ length: 201 }, () => "palabra").join(" ")), 2);
});

test("el índice usa los h2 y el llamado va después de la mitad", () => {
  const blocks = parseBlocks("## Primera sección\n\n" + "uno ".repeat(20) + "\n\n## Segunda\n\n" + "dos ".repeat(20));
  assert.deepEqual(
    blocks.flatMap((block) => (block.type === "h2" ? [block.text] : [])),
    ["Primera sección", "Segunda"],
  );
  const split = splitForCta(blocks);
  assert.equal(split.before.at(-1)?.type, "p");
  assert.equal(split.after[0]?.type, "h2");
});

test("el RSS no incluye el borrador", () => {
  const xml = rssXml("2026-10-27");
  assert.match(xml, /<title>Blog de Cuidalo<\/title>/);
  assert.equal(xml.includes("golpe-de-calor-en-perros"), false);
});

test("un precio sin enlace a /precios no pasa", () => {
  assert.throws(() => assertNoLoosePrice("precio.md", "La guardia sale $ 80000."), /content\/blog\/precio\.md: menciona un precio/);
  assert.doesNotThrow(() => assertNoLoosePrice("precio.md", "Los montos están en [Precios](/precios)."));
});
