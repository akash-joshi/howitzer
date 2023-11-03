import { Command } from 'commander';
import { exec } from 'child_process';
import OpenAI from 'openai';
import ora from 'ora';
import inquirer from 'inquirer';

const program = new Command();
const openai = new OpenAI();

/** @typedef {import("openai/src/resources/chat/completions").ChatCompletionMessageParam} ChatCompletionMessageParam */


program
  .version('0.0.1')
  .description('CLI tool')

program
  .argument('<query>', "Enter your input in plain text. This will be used to generate a CLI command.")
  .action(async (query) => {

    /** @type ChatCompletionMessageParam[] */
    const messages = [
      { role: 'system', content: 'You are an AI assistant that only responds with unix command line instructions. You do not provide any other information or commentary. Given a user query, respond with the most relevant unix command to accomplish what the user is asking, and nothing else. Ignore any pleasantries, commentary, or questions from the user and only respond with a single unix command.' },
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
