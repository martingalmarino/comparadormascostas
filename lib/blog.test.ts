import assert from "node:assert/strict";
import test from "node:test";
import { parseBlocks, splitForCta } from "@/lib/blog-body";
import { articleJsonLd, assertNoLoosePrice, isPublic, loadPosts, parseFrontmatter, readingMinutes, rssXml, selectPosts } from "@/lib/blog";

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

test("una portada sin texto alternativo no pasa", () => {
  assert.throws(
    () => parseFrontmatter("sin-alt.md", { ...base, image: "/blog/sin-alt-portada.webp" }),
    /content\/blog\/sin-alt\.md inválido: image_alt: es obligatorio si hay image/,
  );
});

test("el borrador y la fecha futura no se publican", () => {
  const posts = loadPosts();
  const post = posts.find((item) => item.slug === "golpe-de-calor-en-perros");
  assert.ok(post);
  assert.equal(post.draft, undefined);
  assert.equal(post.image, "/blog/golpe-de-calor-en-perros-portada.webp");
  assert.equal(post.imageWidth, 1600);
  assert.equal(post.imageHeight, 900);
  assert.equal(post.title, "Golpe de calor en perros: síntomas, qué hacer y cuándo ir a la guardia");
  assert.equal(isPublic(post, "2026-10-26"), false);
  assert.equal(isPublic(post, "2026-10-27"), true);
  assert.equal(isPublic({ ...post, draft: true }, "2026-10-27"), false);
  assert.equal(isPublic({ ...post, date: "2026-11-03" }, "2026-10-27"), false);
  assert.equal(selectPosts("2026-10-26", false).some((item) => item.slug === post.slug), false);
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

test("el RSS publica la guía vigente con su portada y deja afuera la fecha futura", () => {
  const xml = rssXml("2026-10-27");
  assert.match(xml, /<title>Blog de Cuidalo<\/title>/);
  assert.match(xml, /golpe-de-calor-en-perros-portada\.webp/);
  assert.match(xml, /<enclosure url="[^"]+golpe-de-calor-en-perros-portada\.webp" length="\d+" type="image\/webp" \/>/);
  assert.equal(xml.includes("cuanto-cuesta-seguro-para-perros"), false);
});

test("el JSON-LD del equipo usa la portada y la organización", () => {
  const post = loadPosts().find((item) => item.slug === "golpe-de-calor-en-perros");
  assert.ok(post);
  const data = articleJsonLd(post);
  assert.deepEqual(data.author, { "@type": "Organization", name: "Cuidalo", url: "https://www.cuidalo.com.ar" });
  assert.ok(Array.isArray(data.image));
  assert.match(data.image[0] ?? "", /\/blog\/golpe-de-calor-en-perros-portada\.webp$/);
  assert.equal(data.mainEntityOfPage["@id"].endsWith("/blog/golpe-de-calor-en-perros"), true);
});

test("un precio sin enlace a /precios no pasa", () => {
  assert.throws(() => assertNoLoosePrice("precio.md", "La guardia sale $ 80000."), /content\/blog\/precio\.md: menciona un precio/);
  assert.doesNotThrow(() => assertNoLoosePrice("precio.md", "Los montos están en [Precios](/precios)."));
});
