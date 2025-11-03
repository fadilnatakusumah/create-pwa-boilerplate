// src/generator.ts

import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { type PWAConfig } from "./types.js";

// 🔑 NEW: Define __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

enum Frontend {
  React = "react",
  Vue = "vue",
  Svelte = "svelte",
}

const templatePlaceholders: Record<Frontend, { [key: string]: string }> = {
  [Frontend.React]: {
    "// tailwindCSSImportsPlaceholder": `@import "tailwindcss";`,
    "// tailwindCSSPackagePlaceholder": `"@tailwindcss/vite": "^4.1.16",\n    "tailwindcss": "^4.1.16,`,
    "// tailwindCSSViteConfig": `import tailwindcss from '@tailwindcss/vite'`,
    "// tailwindCSSFunctionViteConfig": `tailwindcss(),`,
  },
  [Frontend.Vue]: {
    "// vuePlaceholder": "",
    // Add other properties for Vue here
  },
  [Frontend.Svelte]: {
    "// sveltePlaceholder": "",
    // Add other properties for Svelte here
  },
};

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
  // 1. Handle PWA Metadata Replacements (as before)
  let result = content.replace(/<%= pwa\.name %>/g, config.pwa.name);
  result = result.replace(/<%= pwa\.shortName %>/g, config.pwa.shortName);
  result = result.replace(/<%= pwa\.themeColor %>/g, config.pwa.themeColor);
  result = result.replace(
    /<%= pwa\.backgroundColor %>/g,
    config.pwa.backgroundColor
  );
  result = result.replace(/<%= pwa\.displayMode %>/g, config.pwa.displayMode);

  // 2. Handle TailwindCSS configuration
  if (config.useTailwind) {
    const placeholdersTemplates = templatePlaceholders[config.framework];
    for (const placeholder in placeholdersTemplates) {
      result = result.replace(
        placeholder,
        placeholdersTemplates[placeholder] as string
      );
    }
  } else {
    const placeholdersTemplates = templatePlaceholders[config.framework];
    for (const placeholder in placeholdersTemplates) {
      result = result.replace(placeholder, "");
    }
  }

  // 3. Handle other placeholders

  // a) Handle the more complex conditional blocks (like the whole line in vite.config.ts)
  // We will use a unique block placeholder (e.g., '') in the template

  return result;
};

export function generateProject(config: PWAConfig): void {
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
    "src/index.css.ejs",
    "vite.config.ts.ejs",
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

  // 3. Remove unnecessary files if not using Tailwind
  console.log("🚀 ~ generateProject ~ config.useTailwind:", config.useTailwind);
  if (!config.useTailwind) {
    const filesToRemove = fs
      .readdirSync(path.join(destinationPath, "src/components"))
      .filter((fileName) => fileName.endsWith(".tailwindcss.tsx"));
    filesToRemove.forEach((fileName) =>
      fs.removeSync(path.join(destinationPath, "src/components", fileName))
    );
  } else {
    // rename the tailwind files and remove others
    const filesToRemove = fs
      .readdirSync(path.join(destinationPath, "src/components"))
      .filter((fileName) => !fileName.endsWith(".tailwindcss.tsx"));
    filesToRemove.forEach((fileName) =>
      fs.removeSync(path.join(destinationPath, "src/components", fileName))
    );
    fs.readdirSync(path.join(destinationPath, "src/components")).forEach(
      (fileName) => {
        const newFileName = fileName.replace(".tailwindcss", "");
        fs.renameSync(
          path.join(destinationPath, "src/components", fileName),
          path.join(destinationPath, "src/components", newFileName)
        );
      }
    );
  }

  console.log(chalk.green("Injected PWA and project variables."));

  // 4. Final step: Run initial install (simulated)
  runCommand("pnpm install", destinationPath);
}

// NOTE: Don't forget to export this function from your module!
// e.g., export { generateProject };
