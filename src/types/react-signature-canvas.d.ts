declare module 'react-signature-canvas' {
  import React from 'react';

  interface SignatureCanvasRef {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(type?: string, encoderOptions?: number): string;
    getTrimmedCanvas(): HTMLCanvasElement;
    fromDataURL(dataUrl: string, options?: { ratio?: number; width?: number; height?: number; maxWidth?: number; maxHeight?: number }): void;
    getCanvas(): HTMLCanvasElement;
  }

  interface SignatureCanvasProps {
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    penColor?: string;
    backgroundColor?: string;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    dotSize?: number | (() => number);
    throttle?: number;
    minDistance?: number;
    onEnd?: () => void;
    onBegin?: () => void;
  }

  const SignatureCanvas: React.ForwardRefExoticComponent<
    SignatureCanvasProps & React.RefAttributes<SignatureCanvasRef>
  >;

  export type { SignatureCanvasRef };
  export default SignatureCanvas;
}
