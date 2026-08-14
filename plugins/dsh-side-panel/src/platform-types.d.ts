declare module 'react' {
  export function createElement(type: unknown, props: Record<string, unknown>): unknown
}

declare module 'react-dom' {
  export function flushSync(callback: () => void): void
}

declare module 'react-dom/client' {
  export interface Root {
    render(node: unknown): void
    unmount(): void
  }

  export function createRoot(container: Element): Root
}
