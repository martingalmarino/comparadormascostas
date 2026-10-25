export const saludo =
  "¡Hola! Soy CuidaloBot. Te ayudo a encontrar planes y precios para tu mascota. Elegí una pregunta o escribí la tuya.";

export const subtitulo = "Responde solo con datos publicados en Cuidalo";

export const launcher = "Preguntale a CuidaloBot";

export const placeholder = "Escribí: perro, gato, provincia, marca…";

export const pie = "Cuidalo no vende seguros. Respuestas automáticas con datos del sitio.";

export const sinDato = "No tengo ese dato todavía";

export const sinRespuesta =
  "No tengo una respuesta armada para eso. Elegí una pregunta o escribí perro, gato, una provincia o una marca.";

export const noEntendi = "No entendí esa opción.";

export const slotPregunta = {
  especie: "¿Para qué mascota?",
  provincia: "¿En qué provincia vivís?",
  marca: "¿De qué marca?",
  marcaContacto: "¿Qué marca querés que te contacte?",
} as const;

export const tiposTexto =
  "La obra social para mascotas es un plan de salud con red o reintegros. El seguro cubre riesgos puntuales (accidente, responsabilidad civil, robo). El adicional de hogar no es un seguro de mascotas aparte: viene incluido en el seguro de hogar.";

export const vendeTexto =
  "No. Cuidalo es un comparador independiente: no vende seguros ni intermedia la contratación. Si querés, te derivamos a la marca para que te contacte.";

export function contactoTexto(marca: string) {
  return `Dejá tus datos y se los compartimos a ${marca} para que te contacte. Cuidalo no vende el seguro. El formulario pide tu consentimiento para ese envío.`;
}
