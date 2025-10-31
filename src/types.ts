// src/types.ts
export interface PWAConfig {
  projectName: string;
  framework: "react" | "vue" | "svelte";
  useTailwind: boolean;
  pwa: {
    name: string;
    themeColor: string; // e.g., '#FFFFFF'
    display: "standalone" | "fullscreen" | "minimal-ui";
  };
}
