# TechCorp AI Chat

Interface web temps réel pour interagir avec le modèle `Phi-3.5-Financial` déployé par l'équipe Infra. 

## Prérequis
- [Node.js](https://nodejs.org/) installé sur votre machine.
- Serveur d'inférence démarré (Ollama ou compatible OpenAI).

## Lancer le projet

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Démarrez le serveur de développement Vite :
   ```bash
   npm run dev
   ```
3. Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

## Configuration du Backend

L'URL de l'API, le nom du modèle, et le format de la requête sont centralisés dans le fichier `src/config.ts`.
Aucun ajustement n'est requis par l'utilisateur final ; l'équipe de développement / infra peut ajuster les valeurs via le code ou les variables d'environnement.

Vous pouvez configurer l'API en créant un fichier `.env` à la racine :
```env
VITE_API_URL=http://localhost:11434/v1/chat/completions
VITE_MODEL_NAME=phi3.5-financial
```

Pour basculer d'une API compatible OpenAI à une API Ollama pure (`/api/chat`), passez la variable `isOpenAIFormat` à `false` dans `src/config.ts`.

## Format de requête attendu (géré par l'application)

L'application envoie une requête POST contenant l'historique complet (sans flux continu).

**Si `isOpenAIFormat` = true (ex: vLLM, OpenAI, Ollama v1/chat) :**
```json
{
  "model": "phi3.5-financial",
  "messages": [
    { "role": "user", "content": "Bonjour !" }
  ],
  "stream": false
}
```
*Réponse attendue :* `data.choices[0].message.content`

**Si `isOpenAIFormat` = false (Ollama pur) :**
```json
{
  "model": "phi3.5-financial",
  "messages": [
    { "role": "user", "content": "Bonjour !" }
  ],
  "stream": false
}
```
*Réponse attendue :* `data.message.content`
