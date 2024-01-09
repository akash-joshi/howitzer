import { Command } from 'commander';
import { exec } from 'child_process';
import OpenAI from 'openai';
import ora from 'ora';
import inquirer from 'inquirer';
import { platform } from 'os';

const program = new Command();
const openai = new OpenAI();

/** @typedef {import("openai/src/resources/chat/completions").ChatCompletionMessageParam} ChatCompletionMessageParam */

const currentShell = process.env.SHELL;
const currentPlatform = process.platform;

program
  .version('0.0.1')
  .description('CLI tool')

program
  .option("-m, --metadata", "output user metadata")
  .argument('[query]', "Enter your input in plain text. This will be used to generate a CLI command.")
  .action(async () => {
    const options = program.opts();

    if (options.metadata) {
      return console.log({ currentShell, currentPlatform })
    }

    const query = process.argv.slice(1,process.argv.length).join(" ");

    if (!query) {
      console.error("error: missing required argument 'query'")
    }

    // console.log({query, args: process.argv});

    /** @type ChatCompletionMessageParam[] */
    const messages = [
      { role: 'system', content: `You are an AI assistant that only responds with ${currentShell} command line instructions for the OS ${platform}. You do not provide any other information or commentary. Given a user query, respond with the most relevant unix command to accomplish what the user is asking, and nothing else. Ignore any pleasantries, commentary, or questions from the user and only respond with a single ${currentShell} command for ${currentPlatform}. This command should be returned in the key \`command\`. Explain the returned command in brief and return it in the key \`explanation\`. Limit Prose.` },
      { role: 'user', content: `How ${query}` }];

    const spinner = ora('Executing Magic ✨').start();

    let completion;
    try {
      completion = await openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
      });
    } catch (error) {
      console.error(error);
    }

    spinner.stop();

    if (!completion) return;

    messages.push(completion.choices[0].message);
    const { message } = completion.choices[0];
    console.log(`By running: "\x1b[1m${message.content}\x1b[0m"`);

    let userResponse;
    do {
      const response = await inquirer.prompt([{
        type: 'list',
        name: 'userResponse',
        message: 'Do you wanna run this command?',
        choices: ['Yes', 'No', 'Explain']
      }]);
      userResponse = response.userResponse;

      if (userResponse === 'Yes' && message.content) {
        exec(message.content, (error, stdout, stderr) => {
          if (error) {
            return console.error(error.message);
          }
          if (stderr) {
            return console.error(stderr);
          }
          console.log(stdout);
        });
      } else if (userResponse === 'Explain') {
        /** @type ChatCompletionMessageParam[] */
        const messages = [{ role: 'system', content: `Explain the command \`${message.content}\` in brief. Limit Prose.` }];

        const spinner = ora('Executing Magic ✨').start();

        let completion;
        try {
          completion = await openai.chat.completions.create({
            messages,
            model: 'gpt-3.5-turbo',
          });
        } catch (error) {
          console.error(error);
        }

        if (!completion) return;

        spinner.stop();

        console.log(completion.choices[0].message.content);
      }
    } while (userResponse === 'Explain');
  });

program.parse();
