// TypeScript declaration for 'debug' as namespace to fix Colyseus typings

declare namespace debug {
  export function log(...args: any[]): void;
  export function info(...args: any[]): void;
  export function error(...args: any[]): void;
  export function warn(...args: any[]): void;
}
