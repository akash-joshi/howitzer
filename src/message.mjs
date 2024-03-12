import fs from "fs"
import { platform } from 'os';

const currentShell = process.env.SHELL;
const currentPlatform = process.platform;

/** @typedef {import("openai").OpenAI.ChatCompletionMessageParam} ChatCompletionMessageParam */


export function generateMainMessage(query) {
  const files = fs.readdirSync(process.cwd());
  const fileStats = files.map(file => {
    const stats = fs.statSync(file);
    return {
      name: file,
      size: `${stats.size} bytes`,
      lastUpdated: stats.mtime,
      creationTime: stats.birthtime
    };
  });

  /** @type ChatCompletionMessageParam[] */
  const messages = [
    { role: 'system', content: `Current file system information: ${JSON.stringify(fileStats)}` },
    { role: 'system', content: `You are an AI assistant that only responds with ${currentShell} command line instructions for the OS ${platform}. You do not provide any other information or commentary. Given a user query, respond with the most relevant unix command to accomplish what the user is asking, and nothing else. Ignore any pleasantries, commentary, or questions from the user and only respond with a single ${currentShell} command for ${currentPlatform}. Return this data in the JSON format. This command should be returned in the key \`command\`. Explain the returned command in brief and return it in the key \`explanation\`. Limit Prose.` },
    { role: 'user', content: `How ${query}` }
  ];
  return messages;
}