/// <reference types="vite/client" />

// Allow AppKit web components in JSX without type errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

