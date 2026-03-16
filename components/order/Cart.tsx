import { MAPPED_TYPES } from "@/lib/constant";
import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { CartItem } from "../order-interface";
import { MenuItem, MenuItemTypes } from "@/lib/types";
import { OptionCartItem } from "./Options";
import { Input } from "../ui/input";

const TYPE_COLUMNS: MenuItemTypes[] = [
  "bar",
  "primi",
  "secondi",
  "contorni",
  "dolci",
  // "varie",
];

export const Cart = ({
  cart,
  removeFromCart,
  addToCart,
  updateQuantity,
  children,
  itemOptions,
  setItemOptions,
}: {
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  addToCart: (item: MenuItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  children?: React.ReactNode;
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
  return (
    <div className="flex flex-col gap-4 h-fit">
      {/* <div className="p-4 flex items-center justify-between mb-2">
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
      </div> */}

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-sm italic">Il carrello è vuoto.</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="grid gap-2 w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            {TYPE_COLUMNS.map((type) => {
              const items = cart.filter((i) => i.item.type === type);
              if (items.length === 0) return null;
              return (
                <div
                  key={type}
                  className="flex flex-col rounded-lg border border-slate-200 overflow-hidden min-w-0"
                >
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium uppercase tracking-tight text-slate-600 shrink-0"
                    style={{
                      background: MAPPED_TYPES[type].color,
                      borderBottom: "1px solid var(--border, #e2e8f0)",
                    }}
                  >
                    {type}
                  </div>
                  <div className="flex flex-col gap-1 p-2 bg-white">
                    {items.length === 0 ? (
                      <span className="text-xs text-slate-400 italic py-2">
                        —
                      </span>
                    ) : (
                      items.map((i) => (
                        <div
                          key={i.item.id}
                          className="grid grid-cols-1 border-b border-slate-200 gap-1.5 text-sm p-1 pb-2"
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-4 justify-between">
                              <span className="text-sm font-medium text-slate-800 line-clamp-2">
                                {i.item.name}
                              </span>
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-md bg-white hover:bg-slate-100 border-slate-200"
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
                                  className="h-7 w-8 text-center text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 border-slate-200 rounded-md focus-visible:ring-blue-500"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-md bg-white hover:bg-slate-100 border-slate-200"
                                  onClick={() => addToCart(i.item)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
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
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
