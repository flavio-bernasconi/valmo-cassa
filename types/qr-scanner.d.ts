declare module "@yudiel/react-qr-scanner" {
  import * as React from "react";

  export interface QrScannerProps {
    onDecode?: (result: string | null) => void;
    onError?: (error: unknown) => void;
    constraints?: MediaTrackConstraints;
    className?: string;
    containerStyle?: React.CSSProperties;
  }

  export const QrScanner: React.FC<QrScannerProps>;
}

