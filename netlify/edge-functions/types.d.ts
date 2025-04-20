declare module "https://esm.sh/react@18.2.0" {
  import * as React from 'react';
  export = React;
}

declare module "https://deno.land/x/og_edge/mod.ts" {
  export class ImageResponse extends Response {
    constructor(
      element: React.ReactElement,
      options?: {
        width?: number;
        height?: number;
        fonts?: Array<{
          name: string;
          data: ArrayBuffer;
          weight?: number;
          style?: string;
        }>;
        debug?: boolean;
        emoji?: "twemoji" | "blobmoji" | "noto" | "openmoji";
      }
    );
  }
} 