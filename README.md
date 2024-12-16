## Howitzer CLI Helper

### Description

⚡️ An AI CLI which Generates, Explains and Executes commands inline.

No more faffing about with Stackoverflow or other websites, iterate on and understand commands in your CLI directly!

https://github.com/user-attachments/assets/03f81b7c-0da9-4184-9522-32c1983c042f

### Installation

1. Run `npm i -g howitzer` to install the tool globally.
2. Run `how <your_query>` to run any queries in your CLI.

### Features

- 🤖 Supports all available OpenAI models
- 🔒 Secure Configuration Management
- 🎯 Context-Aware Command Generation
- ⚠️ Smart Warning System for Dangerous Operations
- 🔄 Automatic Error Recovery
- 💡 Command Explanations

### Usage

```bash
how [options] [query]
```

### Arguments

- `[query]`: Enter your query in plain text. This will be used to generate a CLI command.

### Examples

```bash
how do i convert random.pdf to jpeg
```

### Options

- `-c, --config`: Configure API key.
- `-d, --debug`: Log debug data.

### Usage

The tool acts as an AI assistant that responds with Unix command line instructions based on the provided query. It returns the most relevant Unix command to accomplish what the user is asking. The response is provided in JSON format and includes the command along with a brief explanation.

### How It Works

1. **Smart Command Generation**: The tool understands your current directory context and generates appropriate commands
2. **Safety First**: Warns about potentially dangerous operations and asks for confirmation
3. **Error Recovery**: Automatically attempts to fix failed commands with smart suggestions

### Dependencies

- commander
- inquirer
- conf
