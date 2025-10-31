// index.ts (Simplified)
import inquirer from "inquirer";
import { type PWAConfig } from "./src/types.js";

async function promptUser(): Promise<PWAConfig> {
  const answers = await inquirer.prompt([
    // ... all your prompt definitions
    // Example for framework:
    {
      type: "list",
      name: "framework",
      message: "Select a frontend framework:",
      choices: ["react", "vue", "svelte"],
    },
    // ...
  ]);
  // We explicitly cast the inquirer result to our type
  return answers as PWAConfig;
}
