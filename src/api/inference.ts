import { config } from '../config';

/**
 * Construit le corps de la requête selon le format (OpenAI ou Ollama)
 */
export function buildRequestBody(messages: { role: string; content: string }[]) {
  if (config.isOpenAIFormat) {
    return JSON.stringify({
      model: config.model,
      messages: messages,
      stream: false,
    });
  } else {
    return JSON.stringify({
      model: config.model,
      messages: messages,
      stream: false,
    });
  }
}

/**
 * Extrait le texte de la réponse selon le format attendu
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractReply(data: any): string {
  if (config.isOpenAIFormat) {
    return data.choices?.[0]?.message?.content || '';
  } else {
    return data.message?.content || '';
  }
}

/**
 * Fonction utilitaire pour envoyer le message
 */
export async function sendMessage(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: buildRequestBody(messages),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return extractReply(data);
}
