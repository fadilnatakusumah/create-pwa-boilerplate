// index.ts (or main CLI file)
import inquirer from "inquirer";
import {
  type PWAConfig,
  type Framework,
  type PwaDisplayMode,
} from "./src/types.js";
import chalk from "chalk";
import fs from "fs-extra";
// Assuming the generator function is imported
import { generateProject } from "./src/generator.js";

async function promptUser(): Promise<PWAConfig> {
  console.log(chalk.blue.bold("\n--- PWA Boilerplate CLI Setup ---"));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What should the project directory be named?",
      default: "my-pwa-app",
      validate: (input: string) =>
        fs.existsSync(input)
          ? "A directory with this name already exists."
          : true,
    },
    {
      type: "list",
      name: "framework",
      message: "Select your frontend framework:",
      choices: ["react", "vue", "svelte"],
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: "Would you like to use Tailwind CSS?",
      default: true,
    },
    // --- PWA Metadata Prompts ---
    {
      type: "input",
      name: "pwaName",
      message: 'PWA Name (e.g., "Awesome App"):',
      default: "PWA Starter",
    },
    {
      type: "input",
      name: "pwaShortName",
      message: "PWA Short Name (for home screen icon):",
      default: "PWA",
    },
    {
      type: "input",
      name: "themeColor",
      message: "Theme Color (for browser/OS UI, use HEX #):",
      default: "#317EFB",
    },
    {
      type: "input",
      name: "backgroundColor",
      message: "Background Color (for splash screen, use HEX #):",
      default: "#FFFFFF",
    },
    {
      type: "list",
      name: "displayMode",
      message: "Choose PWA Display Mode:",
      choices: ["standalone", "fullscreen", "minimal-ui", "browser"],
      default: "standalone",
    },
  ]);

  // Map the flat inquirer answers to the structured PWAConfig type
  return {
    projectName: answers.projectName,
    framework: answers.framework as Framework,
    useTailwind: answers.useTailwind,
    pwa: {
      name: answers.pwaName,
      shortName: answers.pwaShortName,
      themeColor: answers.themeColor,
      backgroundColor: answers.backgroundColor,
      displayMode: answers.displayMode as PwaDisplayMode,
      iconPath: "icons/pwa-icon-512.png", // Hardcoded path to the template icon
    },
  };
}

async function run() {
  try {
    const config = await promptUser();
    console.log(
      chalk.yellow(`\nStarting project generation for ${config.projectName}...`)
    );

    // This is the next phase (Step 4)
    generateProject(config);

    console.log(chalk.green.bold("\n✅ Project setup complete!"));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(`cd ${config.projectName}`);
    console.log(`npm install (or yarn/pnpm install)`);
    console.log(`npm run dev`);
  } catch (error) {
    console.error(
      chalk.red.bold("\nAn error occurred during CLI execution:"),
      error
    );
  }
}

run(); // Execute the main function
