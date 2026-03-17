"use client"; // Obbligatorio in App Router

import React, { useState } from "react";

export default function WebcamPermission() {
  const [status, setStatus] = useState<string>("");

  const requestCamera = async () => {
    try {
      // Chiede il permesso per il video
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      setStatus("Permesso accordato! ✅");

      // Nota: È buona pratica chiudere lo stream se serve solo per il test dei permessi
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.name === "NotAllowedError") {
        setStatus("Permesso negato dall'utente. ❌");
      } else {
        setStatus(
          "Errore: " +
            (err instanceof Error ? err.message : "Errore sconosciuto"),
        );
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Accesso Fotocamera</h2>
      <button
        onClick={requestCamera}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Attiva Webcam
      </button>
      {status && <p className="mt-4 font-medium">{status}</p>}
    </div>
  );
}
