#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';
import OpenAI from 'openai';
import ora from 'ora';
import inquirer from 'inquirer';
import { platform } from 'os';
import assert from 'assert';

const program = new Command();

/** @typedef {import("openai/src/resources/chat/completions").ChatCompletionMessageParam} ChatCompletionMessageParam */

const currentShell = process.env.SHELL;
const currentPlatform = process.platform;

program
  .version('1.0.1')
  .description('CLI Tool')

program
  .option("-m, --metadata", "output user metadata")
  .argument('[query]', "Enter your input in plain text. This will be used to generate a CLI command.")
  .action(async () => {
    if (!process.env.OPENAI_API_KEY) {
      return console.log("Error: The OpenAI API Key is missing. Please ensure that you have added your OpenAI API Key to your environment variables, using the key OPENAI_API_KEY.")
    }

    const openai = new OpenAI();

    const options = program.opts();

    if (options.metadata) {
      return console.log({ currentShell, currentPlatform })
    }

    const query = process.argv.slice(1, process.argv.length).join(" ");

    if (!query) {
      console.error("error: missing required argument 'query'")
    }

    /** @type ChatCompletionMessageParam[] */
    const messages = [
      { role: 'system', content: `You are an AI assistant that only responds with ${currentShell} command line instructions for the OS ${platform}. You do not provide any other information or commentary. Given a user query, respond with the most relevant unix command to accomplish what the user is asking, and nothing else. Ignore any pleasantries, commentary, or questions from the user and only respond with a single ${currentShell} command for ${currentPlatform}. Return this data in the JSON format. This command should be returned in the key \`command\`. Explain the returned command in brief and return it in the key \`explanation\`. Limit Prose.` },
      { role: 'user', content: `How ${query}` }];

    const spinner = ora('Executing Magic ✨').start();

    let completion;
    try {
      completion = await openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo-0125',
        response_format: { type: "json_object" },
      });
    } catch (error) {
      console.error(error);
    }

    spinner.stop();

    if (!completion) return;

    messages.push(completion.choices[0].message);
    const { message } = completion.choices[0];

    assert(message.content, "Missing content on response")

    /** @typedef {Object} Output 
     *  @property {string} command 
     *  @property {string} explanation 
     */
    /** @type {Output} */
    const output = JSON.parse(message.content);

    console.log(`By running: "\x1b[1m${output.command}\x1b[0m"`);
    console.log(output.explanation);

    let userResponse;
    do {
      const response = await inquirer.prompt([{
        type: 'list',
        name: 'userResponse',
        message: 'Do you wanna run this command?',
        choices: ['Yes', 'No']
      }]);
      userResponse = response.userResponse;

      if (userResponse === 'Yes') {
        exec(output.command, (error, stdout, stderr) => {
          if (error) {
            return console.error(error.message);
          }
          if (stderr) {
            return console.error(stderr);
          }
          console.log(stdout);
        });
      }
    } while (userResponse === 'Explain');
  });

program.parse();
