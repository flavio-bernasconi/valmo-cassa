"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CartItem } from "../order-interface";
import { MenuItem } from "@/lib/types";
import { Button } from "../ui/button";
import { CartQRCodec } from "@/lib/qr-codec";
import { toast } from "sonner";

export const ScannerComponent = ({
  menu,
  setCart,
}: {
  menu: MenuItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
}) => {
  const [pause, setPause] = useState(false);

  const handleScan = async (data: string) => {
    setPause(true);
    try {
      if (!data) return;

      console.log("QR Code trovato:", data);

      const decodeResult = CartQRCodec.decode(data);

      if (!decodeResult.success) {
        toast.error(`Errore QR: ${decodeResult.error}`);
        return;
      }

      const validationResult = CartQRCodec.validateCartAgainstMenu(
        decodeResult.cart!,
        menu,
      );

      if (!validationResult.success) {
        toast.error(`Errore validazione: ${validationResult.error}`);
        return;
      }

      const decodedCart = validationResult.cart!.items.map((item) => ({
        item: menu.find((mi) => mi.id === item.id)!,
        quantity: item.quantity,
      }));

      if (validationResult.warnings && validationResult.warnings.length > 0) {
        toast.warning("Attenzione:", {
          description: validationResult.warnings.join(", "),
        });
      }

      setCart(decodedCart);
      toast.success("Carrello caricato dal QR code!");
    } catch (error) {
      console.error("Errore durante la scansione:", error);
      toast.error("Errore durante l'elaborazione del QR code");
    } finally {
      setPause(true);
    }
  };

  return (
    <div>
      <Scanner
        formats={[
          "qr_code",
          "micro_qr_code",
          "rm_qr_code",
          "maxi_code",
          "pdf417",
          "aztec",
          "data_matrix",
          "matrix_codes",
          "dx_film_edge",
          "databar",
          "databar_expanded",
          "codabar",
          "code_39",
          "code_93",
          "code_128",
          "ean_8",
          "ean_13",
          "itf",
          "linear_codes",
          "upc_a",
          "upc_e",
        ]}
        onScan={(detectedCodes: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handleScan((detectedCodes as any)[0].rawValue);
        }}
        onDecode={(result: string | null) => {
          if (result) handleScan(result);
        }}
        onError={(error: unknown) => {
          console.log(`onError: ${error}'`);
        }}
        styles={{ container: { height: "400px", width: "350px" } }}
        components={{
          audio: true,
          onOff: true,
          torch: true,
          zoom: true,
          finder: true,
        }}
        allowMultiple={true}
        scanDelay={2000}
        paused={pause}
      />
      <Button
        onClick={() => setPause(!pause)}
        className="w-full max-w-xs rounded-md overflow-hidden border border-slate-200"
      >
        {pause ? "Avvia" : "Ferma"}
      </Button>
    </div>
  );
};
