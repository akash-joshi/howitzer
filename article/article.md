# Building an AI-Powered CLI Tool in 2024

## Introduction
- Brief hook about common CLI frustrations
- Introduction to Howitzer as the solution
- What we'll build and learn

## Prerequisites
- Node.js installed
- Basic understanding of JavaScript/ES Modules
- OpenAI API key

## Core Concepts
1. ES Modules vs TypeScript
   - Why ES Modules were chosen
   - Benefits of avoiding build tools
   - Using JSDoc for types

2. Building the CLI Interface
   - Using Commander for command parsing
   - Handling user input with Inquirer
   - Creating an interactive experience

3. AI Integration
   - Setting up OpenAI client
   - Crafting effective system prompts
   - Handling API responses

4. Making CLIs installable
  - Make CLI installable via `bin` property
  - Talk about the shebang problem

5. Cross-Platform Compatibility
   - Detecting user's shell and OS
   - Handling file paths correctly
   - ES Module path resolution

6. Relative Imports in Globally installed Packages
   - The import.meta.url solution
   - Handling package.json paths

## Conclusion
- Key takeaways
- Future improvements
  - Can pick these up from current codebase - eg, error checking, allowing users to select models, etc.
- Where to learn more

## Resources
- GitHub repository
- Related tools and libraries
- Further reading

---

References
- Structure to follow: https://www.freecodecamp.org/news/build-a-url-shortener-in-deno/
- Article on my website: https://thewriting.dev/building-an-ai-based-cli-tool-in-2024/

