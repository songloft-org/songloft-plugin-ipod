declare const __dirname: string;

declare module "*.svg" {
  const source: string;
  export default source;
}

declare module "*.png" {
  const source: string;
  export default source;
}

declare module 'path' {
  const path: {
    resolve(...paths: string[]): string;
  };
  export default path;
}
