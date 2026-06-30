/**
 * Valeurs de configuration depuis l'environnement ou par défaut pour Ollama
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:11434/api/chat';
const MODEL_NAME = import.meta.env.VITE_MODEL_NAME || 'llama3';

/**
 * Fonction utilitaire pour envoyer le message via Ollama
 */
export async function sendMessage(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP avec Ollama: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content || '';
}
