// src/types.ts

/**
 * Defines the supported frontend frameworks for the boilerplate.
 */
export type Framework = 'react' | 'vue' | 'svelte';

/**
 * Defines the display modes available for the PWA manifest.
 */
export type PwaDisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

/**
 * Interface for PWA-specific metadata gathered from the user.
 */
export interface PwaMetadata {
  /** The full name of the application (e.g., "My Awesome PWA"). */
  name: string;
  /** The short name of the application, used on home screens (e.g., "My PWA"). */
  shortName: string;
  /** The default color for the application's theme (e.g., "#007bff"). */
  themeColor: string;
  /** The background color used on the splash screen (e.g., "#ffffff"). */
  backgroundColor: string;
  /** The preferred way to display the application (e.g., 'standalone'). */
  displayMode: PwaDisplayMode;
  /** The path to the main application icons. */
  iconPath: string;
}

/**
 * The final, complete configuration object derived from user prompts.
 * This object dictates which templates and features are included.
 */
export interface PWAConfig {
  /** The target directory name for the new project. */
  projectName: string;
  /** The selected frontend framework. */
  framework: Framework;
  /** Whether to integrate Tailwind CSS. */
  useTailwind: boolean;
  /** The PWA metadata to be injected into the manifest and index.html. */
  pwa: PwaMetadata;
}