// // src/generator.ts
// import { type PWAConfig } from "./types.js";
// import * as fs from "fs-extra";

// export function generateProject(config: PWAConfig): void {
//   const templatePath = `./templates/${config.framework}-ts-base`;
//   const destinationPath = config.projectName;

//   // 1. Copy the base template
//   fs.copySync(templatePath, destinationPath);

//   // 2. Templating (Type-safe injection)
//   const manifestPath = `${destinationPath}/public/manifest.json.ejs`;
//   let manifestContent = fs.readFileSync(manifestPath, "utf-8");

//   // Replace placeholders using the typed config object
//   manifestContent = manifestContent.replace("<%= pwa.name %>", config.pwa.name);
//   manifestContent = manifestContent.replace(
//     "<%= pwa.themeColor %>",
//     config.pwa.themeColor
//   );
//   // ...

//   fs.writeFileSync(`${destinationPath}/public/manifest.json`, manifestContent);
//   fs.removeSync(manifestPath); // Remove the template file

//   // 3. Handle Tailwind (Conditional Logic)
//   if (config.useTailwind) {
//     // Logic to update package.json, copy config files, and inject imports
//   }

//   // 4. Install Dependencies
//   // runCommand('npm install', destinationPath);
// }

// src/generator.ts

import { type PWAConfig } from "./types.js";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

/**
 * Runs a shell command and logs output (simplified for this draft)
 */
const runCommand = (command: string, cwd: string) => {
  // In a real CLI, you'd use child_process.spawnSync or similar.
  console.log(chalk.gray(`> Running command: ${command} in ${cwd}`));
};

/**
 * Finds and replaces EJS-style placeholders in a content string.
 */
const processTemplate = (content: string, config: PWAConfig): string => {
  // PWA Metadata
  let result = content.replace(/<%= pwa\.name %>/g, config.pwa.name);
  result = result.replace(/<%= pwa\.shortName %>/g, config.pwa.shortName);
  result = result.replace(/<%= pwa\.themeColor %>/g, config.pwa.themeColor);
  result = result.replace(
    /<%= pwa\.backgroundColor %>/g,
    config.pwa.backgroundColor
  );
  result = result.replace(/<%= pwa\.displayMode %>/g, config.pwa.displayMode);

  // Project/Styling flags
  const tailwindClass = config.useTailwind ? "true" : "false";
  result = result.replace(/<%= useTailwind %>/g, tailwindClass);

  return result;
};

export function generateProject(config: PWAConfig): void {
  // 🔑 NEW: Define __dirname equivalent for ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const templateBase = `${config.framework}`;
  const templatePath = path.join(__dirname, "templates", templateBase);
  const destinationPath = path.join(process.cwd(), config.projectName);

  // 1. Copy the base template
  fs.copySync(templatePath, destinationPath, { overwrite: true });
  console.log(chalk.green(`Copied base template to ${destinationPath}`));

  // 2. Process all EJS templates
  const filesToProcess = [
    "package.json.ejs",
    "index.html.ejs",
    "public/manifest.json.ejs",
    "src/components/PwaFeaturesGrid.tsx",
    "src/index.css.ejs",
  ];

  filesToProcess.forEach((filePathEjs) => {
    const fullPathEjs = path.join(destinationPath, filePathEjs);
    const targetPath = fullPathEjs.replace(".ejs", "");

    if (fs.existsSync(fullPathEjs)) {
      let content = fs.readFileSync(fullPathEjs, "utf-8");
      content = processTemplate(content, config);

      fs.writeFileSync(targetPath, content, "utf-8");
      fs.removeSync(fullPathEjs); // Remove the EJS file
    }
  });
  console.log(chalk.green("Injected PWA and project variables."));

  // 3. Conditional: Tailwind CSS Setup
  if (config.useTailwind) {
    // A. Copy Tailwind config files
    const tailwindPath = path.join(
      process.cwd(),
      "templates",
      "addons",
      "tailwind"
    );
    fs.copySync(tailwindPath, destinationPath, { overwrite: true });

    // B. Add Tailwind dependencies to package.json (simplified)
    // In a real scenario, you'd parse/edit the package.json object
    runCommand(
      "npm install -D tailwindcss postcss autoprefixer",
      destinationPath
    );
    console.log(chalk.yellow("Tailwind CSS configuration added."));
  }

  // 4. Final step: Run initial install (simulated)
  runCommand("npm install", destinationPath);
}

// NOTE: Don't forget to export this function from your module!
// e.g., export { generateProject };
