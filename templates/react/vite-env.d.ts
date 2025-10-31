// templates/react-ts-base/src/vite-env.d.ts

/// <reference types="vite/client" />

// Declaration for importing non-code assets (like SVG, PNG, JPG)
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

// Add declarations for other non-TS files imported directly (e.g., Worker scripts if needed)
// declare module "some-module-without-types";