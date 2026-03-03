import { useEffect, useState } from "react";
import { Input } from "../ui/input";

export const Change = ({ totalPrice }: { totalPrice: string }) => {
  const [received, setReceived] = useState("");
  const [change, setChange] = useState("0.00");

  useEffect(() => {
    if (received) {
      setChange((parseFloat(received) - parseFloat(totalPrice)).toFixed(2));
    } else {
      setChange("0.00");
    }
  }, [received, totalPrice]);

  return (
    <div className="flex flex-col items-end gap-1 font-bold">
      <span className="whitespace-nowrap text-2xl self-end">
        Totale €{totalPrice}
      </span>
      <div className="flex items-center justify-between gap-3 font-bold">
        <Input
          type="number"
          placeholder="Importo"
          onChange={(e) => setReceived(e.target.value)}
          className="w-32 h-8"
        />
        <span className="text-md font-medium whitespace-nowrap min-w-32">
          Resto: €{change}
        </span>
      </div>
    </div>
  );
};
