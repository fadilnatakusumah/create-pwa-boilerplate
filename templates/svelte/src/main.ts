import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'


// --- PWA Service Worker Registration ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Note: The final file output from Workbox/VitePWA will be service-worker.js
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered successfully:", registration);
      })
      .catch((registrationError) => {
        console.error("SW registration failed:", registrationError);
      });
  });
}


const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
