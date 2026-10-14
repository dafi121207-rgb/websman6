import "react";

declare global {
  interface HTMLVideoElement {
    playsInline: boolean;
    captureStream?(): MediaStream;
  }
}

export {};
