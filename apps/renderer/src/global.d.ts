export {}

declare global {
  interface Window {
    api: {
      queryDay: (dateISO: string) => Promise<unknown>
    }
  }
}

