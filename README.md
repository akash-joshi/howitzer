## How CLI Tool

### Description

⚡️ An AI CLI which Generates, Explains and Executes commands inline.

No more faffing about with Stackoverflow or other websites, iterate on and understand commands in your CLI directly!

https://github.com/akash-joshi/howtf/assets/22196279/f680d487-5176-46ee-a5b5-b61636604555

### Installation

1. Run `npm i -g hey-how` to install the tool globally.
2. Run `how <your_query>` to run any queries in your CLI.

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

### Execution

- Upon receiving the command, the tool executes it with a prompt asking if the user wants to run the command.
- If the user agrees, the command is executed, and the output is displayed.
- If the user disagrees, the execution stops.

### Dependencies

- commander
- inquirer
- conf
