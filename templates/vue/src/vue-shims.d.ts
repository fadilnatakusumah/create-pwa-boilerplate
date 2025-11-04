// src/vue-shims.d.ts

// This file tells TypeScript that imported .vue files are valid Vue components.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // Use "any" if you need to be less strict, but DefineComponent is safer
  const component: DefineComponent<{}, {}, any> 
  export default component
}