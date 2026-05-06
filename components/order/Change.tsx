import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { CartItem } from "../order-interface";

export const Change = ({
  totalPrice,
  cart,
}: {
  totalPrice: string;
  cart: CartItem[];
}) => {
  const [received, setReceived] = useState("");
  const [change, setChange] = useState("0.00");

  useEffect(() => {
    if (cart.length === 0) {
      setChange("0.00");
      setReceived("");
      return;
    }

    if (received) {
      setChange((parseFloat(received) - parseFloat(totalPrice)).toFixed(2));
    } else {
      setChange("0.00");
    }
  }, [received, totalPrice, cart]);

  return (
    <div className="flex flex-col items-end gap-1 font-bold mr-6">
      <span className="whitespace-nowrap text-2xl self-end">
        Totale €{totalPrice}
      </span>
      <div className="flex items-center justify-between gap-3 font-bold mt-4">
        <Input
          disabled={cart.length === 0}
          value={received || ""}
          type="number"
          placeholder="Importo cliente"
          onChange={(e) => setReceived(e.target.value)}
          className="w-[150px] h-10 border-2 border-gray-700 rounded-md"
        />
        <span className="text-xl font-medium whitespace-nowrap min-w-32">
          Resto: €{change}
        </span>
      </div>
    </div>
  );
};
