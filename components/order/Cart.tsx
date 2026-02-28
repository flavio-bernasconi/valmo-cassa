import { MAPPED_TYPES } from "@/lib/constant";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem } from "../order-interface";
import { MenuItem } from "@/lib/types";
import { OptionCartItem } from "./Options";

const sortKeys = Object.keys(MAPPED_TYPES);

export const Cart = ({
  cart,
  removeFromCart,
  addToCart,
  children,
  clearCart,
  itemOptions,
  setItemOptions,
}: {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  addToCart: (item: MenuItem) => void;
  children: React.ReactNode;
  clearCart: () => void;
  itemOptions?: {
    [key: string]: { isTakeout: boolean; printSeparateTickets: boolean };
  };
  setItemOptions?: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: { isTakeout: boolean; printSeparateTickets: boolean };
        }
      | undefined
    >
  >;
}) => {
  const totalPrice = cart.reduce(
    (acc, val) => acc + val.item.price * val.quantity,
    0,
  );

  return (
    <div className="flex flex-col min-w-[35vw] gap-4 sticky top-24 h-fit border p-6 rounded-xl bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-light">Il Tuo Ordine</h3>
          <span className="text-md text-slate-900 bg-slate-100 p-1">
            €{totalPrice.toFixed(2)}
          </span>
        </div>
        {cart.length > 0 && (
          <Button variant="outline" onClick={clearCart} size="sm">
            <Trash2 className="w-5 h-5" /> Cancella ordine
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">
          Il carrello è vuoto.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {cart
              .sort(
                (a, b) =>
                  sortKeys.indexOf(a.item.type) - sortKeys.indexOf(b.item.type),
              )
              .map((i) => (
                <div
                  key={i.item.id}
                  className="grid grid-cols-[3fr_auto_1fr] items-center gap-3 text-sm"
                >
                  <div className="flex flex-col">
                    <div className="flex gap-2 mr-4 items-center">
                      <span
                        style={{ background: MAPPED_TYPES[i.item.type].color }}
                        className="min-h-4 min-w-4 rounded-full"
                      />
                      <span className="text-lg font-medium">
                        {i.quantity} {i.item.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-6">
                      {(i.quantity * i.item.price).toFixed(2)}€
                    </span>
                  </div>
                  <OptionCartItem
                    itemOptions={itemOptions?.[i.item.id!]}
                    setItemOptions={(value) => {
                      setItemOptions?.((prev) => {
                        const next =
                          typeof value === "function"
                            ? value(prev?.[i.item.id!])
                            : value;
                        if (!next) {
                          if (!prev) return undefined;
                          const nextOptions = { ...prev };
                          delete nextOptions[i.item.id!];
                          return Object.keys(nextOptions).length > 0
                            ? nextOptions
                            : undefined;
                        }
                        return { ...prev, [i.item.id!]: next };
                      });
                    }}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFromCart(i.item.id!)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-4 text-xl text-center font-bold">
                      {i.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addToCart(i.item)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {children}
        </>
      )}
    </div>
  );
};
