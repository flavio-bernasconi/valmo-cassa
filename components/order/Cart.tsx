import { MAPPED_TYPES } from "@/lib/constant";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem } from "../order-interface";
import { MenuItem } from "@/lib/types";
import { OptionCartItem } from "./Options";
import { Input } from "../ui/input";

const sortKeys = Object.keys(MAPPED_TYPES);

export const Cart = ({
  cart,
  removeFromCart,
  addToCart,
  updateQuantity,
  children,
  clearCart,
  itemOptions,
  setItemOptions,
}: {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  addToCart: (item: MenuItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
    <div className="flex flex-col min-w-[35vw] gap-4 sticky top-24 h-fit border p-6 rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-light uppercase tracking-tight text-slate-500">
            Il Tuo Ordine
          </h3>
          <span className="text-xl font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            €{totalPrice.toFixed(2)}
          </span>
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearCart}
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Svuota
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-sm italic">Il carrello è vuoto.</p>
        </div>
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
                  className="grid grid-cols-[3fr_auto_1fr] items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex flex-col">
                    <div className="flex gap-2 mr-4 items-center">
                      <span
                        style={{ background: MAPPED_TYPES[i.item.type].color }}
                        className="min-h-3 min-w-3 rounded-full shadow-sm"
                      />
                      <span className="text-base font-semibold text-slate-800">
                        {i.item.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-5 font-mono">
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
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 border-slate-200"
                      onClick={() => removeFromCart(i.item.id!)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={i.quantity}
                      onChange={(e) =>
                        updateQuantity(
                          i.item.id!,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="h-8 w-14 text-center text-base font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 border-slate-200 rounded-md focus-visible:ring-blue-500"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-md bg-white hover:bg-slate-100 border-slate-200"
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
