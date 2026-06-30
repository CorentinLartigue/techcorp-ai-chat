/**
 * Valeurs de configuration depuis l'environnement
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:11434/v1/chat/completions';
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'phi3.5-financial';
const IS_OPENAI_FORMAT = import.meta.env.VITE_IS_OPENAI_FORMAT !== 'false';

/**
 * Construit le corps de la requête selon le format (OpenAI ou Ollama)
 */
export function buildRequestBody(messages: { role: string; content: string }[]) {
  if (IS_OPENAI_FORMAT) {
    return JSON.stringify({
      model: MODEL_NAME,
      messages: messages,
      stream: false,
    });
  } else {
    return JSON.stringify({
      model: MODEL_NAME,
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
  if (IS_OPENAI_FORMAT) {
    return data.choices?.[0]?.message?.content || '';
  } else {
    return data.message?.content || '';
  }
}

/**
 * Fonction utilitaire pour envoyer le message
 */
export async function sendMessage(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(API_URL, {
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
