import { OpenAI } from 'openai';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interfaz para las sugerencias de secciones
export interface SectionSuggestion {
  id: string;
  title: string;
  category: string;
  description: string;
}

/**
 * Envía un prompt a OpenAI para obtener sugerencias de secciones
 * @param prompt - El prompt del usuario
 * @returns Una lista de sugerencias de secciones
 */
export async function getSectionSuggestions(prompt: string): Promise<SectionSuggestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente especializado en diseño web. Tu tarea es sugerir secciones para una página web basada en el prompt del usuario.
          Debes devolver un JSON con un array de objetos, donde cada objeto representa una sección recomendada.
          Cada sección debe tener: id (string único), title (nombre de la sección), category (hero, services, features, testimonials, pricing, contact, footer, etc.), y description (breve descripción de la sección).
          Limita tus sugerencias a un máximo de 5-7 secciones que tengan sentido juntas.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("No se recibió respuesta de OpenAI");
    }

    // Extraer el JSON de la respuesta
    const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No se pudo extraer JSON de la respuesta");
    }

    const suggestions = JSON.parse(jsonMatch[0]) as SectionSuggestion[];
    return suggestions;
  } catch (error) {
    console.error("Error al obtener sugerencias de OpenAI:", error);
    throw error;
  }
}
