export const config = {
  // Décommentez et modifiez ces valeurs selon le choix final de l'équipe Infra
  
  // Format Ollama
  // apiUrl: 'http://localhost:11434/api/chat',
  // model: 'phi3.5-financial',
  // isOpenAIFormat: false,

  // Format OpenAI-compatible
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:11434/v1/chat/completions',
  model: import.meta.env.VITE_MODEL_NAME || 'phi3.5-financial',
  isOpenAIFormat: true,
};
