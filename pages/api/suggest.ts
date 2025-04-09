import type { NextApiRequest, NextApiResponse } from 'next';
import { getSectionSuggestions, SectionSuggestion } from '../../lib/openai';
import { getSectionsByCategories, SectionMetadata } from '../../lib/firebase';

// Interfaz para la respuesta de la API
interface ApiResponse {
  success: boolean;
  suggestions?: SectionSuggestion[];
  sections?: SectionMetadata[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

  try {
    const { prompt } = req.body;

    // Validar que se proporcionó un prompt
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Se requiere un prompt válido' });
    }

    // Obtener sugerencias de OpenAI
    const suggestions = await getSectionSuggestions(prompt);

    // Extraer categorías de las sugerencias
    const categories = suggestions.map(suggestion => suggestion.category);

    // Obtener secciones de la base de datos que coincidan con las categorías
    const sections = await getSectionsByCategories(categories);

    // Devolver sugerencias y secciones
    return res.status(200).json({
      success: true,
      suggestions,
      sections
    });
  } catch (error) {
    console.error('Error en la API de sugerencias:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
}
