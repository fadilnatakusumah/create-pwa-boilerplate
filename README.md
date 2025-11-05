# 🚀 create-pwa-boilerplate

A powerful command-line interface (CLI) tool for quickly generating modern, ready-to-use Progressive Web Application (PWA) boilerplates using React, Vue, or Svelte, pre-configured with Vite, TypeScript, and PWA manifest files.

## ✨ Features

  * **⚡ Framework Choice:** Select from **React**, **Vue 3**, or **Svelte** (all configured with TypeScript).
  * **💨 Vite Integration:** Lightning-fast development and optimized builds powered by Vite.
  * **🎨 Tailwind CSS Option:** Integrate **Tailwind CSS** automatically during scaffolding.
  * **🔔 PWA Ready:** Includes a pre-configured Service Worker (via `vite-plugin-pwa`) with logic for:
      * Offline Caching (via Workbox).
      * **Push Notifications** subscription logic.
      * A demo component showcasing PWA APIs (Camera, Web Share, Battery Status, Geolocation, etc.).

-----

## 💻 Installation and Usage

You can use the tool via `npx` or the modern `npm create` command.

### 1\. Create Your Project

Run the following command and follow the interactive prompts:

```bash
npx create-pwa-boilerplate@latest my-pwa-app-name
# OR
npm create pwa-boilerplate@latest my-pwa-app-name
```

### 2\. Run the App

Navigate into your new directory, install dependencies, and start the development server:

```bash
cd my-pwa-app-name
npm install 
# or pnpm install / yarn install
npm run dev
```

-----

## 🖼️ Included Templates

The generator currently supports the following options:

| Template | Language | Styling | Build Tool |
| :--- | :--- | :--- | :--- |
| **React** | TypeScript | Tailwind CSS (Optional) | Vite |
| **Vue 3** | TypeScript | Tailwind CSS (Optional) | Vite |
| **Svelte** | TypeScript | Tailwind CSS (Optional) | Vite |

-----

## 💡 Testing PWA Capabilities

Each generated project includes a `PwaFeaturesGrid` component demonstrating key native browser features.

1.  **Run Dev Server:** Start your application (`npm run dev`).
2.  **Open in Browser:** Navigate to the app (usually `http://localhost:5173`).
3.  **Inspect:** Open the browser's Developer Tools, go to the **Application** tab, and check the **Service Workers** section. You should see the worker registered.
4.  **Test Push:** Click the "Push Notifications" button in the grid.
5.  **Simulate Push:** Use the browser's Service Worker panel to send a local push message to test your Service Worker's notification display logic (as a backend replacement).

-----

## 🛠️ Development & Contribution

To run and contribute to the `create-pwa-boilerplate` CLI itself:

1.  **Clone the Repository:**

    ```bash
    git clone [Your Repository URL]
    cd create-pwa-boilerplate
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or pnpm install
    ```

3.  **Build the CLI:**

    ```bash
    # Compiles generator/index.ts to dist/index.js
    npm run build
    ```

4.  **Test Locally (Recommended):** Use `npm link` to simulate a global installation.

    ```bash
    # In the root of this project:
    npm link

    # Go to any other directory and test:
    create-pwa-boilerplate my-test-app
    ```

### Publishing

If you are a maintainer, use the following commands. **Ensure the version is incremented before publishing.**

```bash
# Ensure package.json has "files": ["dist", "templates"]
npm run build
npm publish --access public
```

-----

## License
MIT License