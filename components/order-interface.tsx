"use client";

import { useEffect, useState } from "react";
import { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MenuList } from "./menu/MenuList";
import { Cart } from "./order/Cart";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { db, deleteOrder, seedDatabase } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { ConfirmationModal } from "./ConfirmationModal";
import { Change } from "./order/Change";
import QRCode from "react-qr-code";
import { CartQRCodec } from "@/lib/qr-codec";
import { ScannerComponent } from "./scanner";
import { MENU_SORTING_KEY } from "@/lib/constant";

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

type ItemOptionsMap =
  | { [key: string]: { isTakeout: boolean; printSeparateTickets: boolean } }
  | undefined;

function OrderActionsBar({
  cart,
  totalPrice,
  itemOptions,
  setItemOptions,
  setCart,
}: {
  cart: CartItem[];
  totalPrice: number;
  itemOptions: ItemOptionsMap;
  setItemOptions: React.Dispatch<
    React.SetStateAction<
      | {
          [key: string]: {
            isTakeout: boolean;
            printSeparateTickets: boolean;
          };
        }
      | undefined
    >
  >;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printAllTicketsSeparate, setPrintAllTicketsSeparate] = useState(false);
  const [isAllOrderTakeout, setIsAllOrderTakeout] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [showSaveOnlyConfirm, setShowSaveOnlyConfirm] = useState(false);

  useEffect(() => {
    const checkAreAllTakeout =
      cart.length > 0 &&
      Object.keys(itemOptions || {}).length === cart.length &&
      Object.values(itemOptions || {}).every((item) => item.isTakeout);

    const checkAreAllPrintSeparateTickets =
      cart.length > 0 &&
      Object.keys(itemOptions || {}).length === cart.length &&
      Object.values(itemOptions || {}).every(
        (item) => item.printSeparateTickets,
      );

    setIsAllOrderTakeout(checkAreAllTakeout);
    setPrintAllTicketsSeparate(checkAreAllPrintSeparateTickets);
  }, [itemOptions, cart.length]);

  const getPrintPayload = () =>
    cart.map((i) => ({
      name: i.item.name,
      quantity: i.quantity,
      price: i.item.price,
      type: i.item.type,
      isTakeout: itemOptions?.[i.item.id!]?.isTakeout || false,
      printSeparateTickets:
        itemOptions?.[i.item.id!]?.printSeparateTickets || false,
    }));

  const handlePrintOnly = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `print-only-${crypto.randomUUID()}`,
          items: getPrintPayload(),
          printAllTicketsSeparate,
          isAllOrderTakeout,
        }),
      });
      toast.success("Stampa avviata!", {
        description: "L'ordine non è stato salvato.",
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Errore durante la stampa.",
      );
      toast.error("Errore durante la stampa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveOrder = async (withPrint: boolean) => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    const orderId = crypto.randomUUID();

    try {
      await db.transaction("rw", [db.orders, db.order_items], async () => {
        await db.orders.add({
          id: orderId,
          total_price: totalPrice,
          created_at: new Date().toISOString(),
        });

        const orderItems = cart.map((i) => ({
          order_id: orderId,
          menu_item_id: String(i.item.id),
          quantity: i.quantity,
          price_at_time: i.item.price,
          is_takeout: itemOptions?.[i.item.id!]?.isTakeout || false,
        }));

        await db.order_items.bulkAdd(orderItems);
      });

      if (withPrint) {
        await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            items: getPrintPayload(),
            printAllTicketsSeparate,
            isAllOrderTakeout,
          }),
        });
      }

      setCart([]);
      toast.success(
        withPrint
          ? "Ordine inviato con successo!"
          : "Ordine archiviato con successo!",
        {
          description: new Date().toLocaleString("it-IT"),
        },
      );
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Qualcosa è andato storto durante il salvataggio.",
      );
      toast.error(
        withPrint
          ? "Errore durante l'invio dell'ordine!"
          : "Errore durante l'archiviazione dell'ordine!",
      );
      await deleteOrder(orderId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        open={showPrintConfirm}
        onOpenChange={setShowPrintConfirm}
        title="Stampa senza salvare"
        description="Stamperai i ticket senza registrare l'ordine nel sistema. Vuoi continuare?"
        confirmLabel="Stampa"
        cancelLabel="Annulla"
        onConfirm={handlePrintOnly}
      />
      <ConfirmationModal
        open={showSaveOnlyConfirm}
        onOpenChange={setShowSaveOnlyConfirm}
        title="Archivia senza stampare"
        description="L'ordine verrà registrato nel sistema ma non verrà stampato alcun ticket. Vuoi continuare?"
        confirmLabel="Archivia"
        cancelLabel="Annulla"
        onConfirm={() => saveOrder(false)}
      />

      <div className="flex justify-between gap-6 py-3 px-8 rounded-lg bg-white border-2 border-b-gray-100">
        <div className="flex gap-2 flex-wrap">
          <Button
            className="py-6"
            disabled={isSubmitting || cart.length === 0}
            onClick={() => setShowSaveOnlyConfirm(true)}
            size="lg"
            variant="outline"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ...
              </>
            ) : (
              <p className="flex flex-col gap-0">
                Archivia
                <span className="text-xs">senza stampare</span>
              </p>
            )}
          </Button>
          <Button
            className="py-6"
            disabled={isSubmitting || cart.length === 0}
            onClick={() => setShowPrintConfirm(true)}
            size="lg"
            variant="outline"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ...
              </>
            ) : (
              <p className="flex flex-col gap-0">
                Stampa
                <span className="text-xs">senza archiviare</span>
              </p>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCart([]);
            }}
            disabled={isSubmitting || cart.length === 0}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 "
          >
            <Trash2 className="w-3 h-3" /> Cancella
          </Button>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2 mt-4">
            <Checkbox
              id="print"
              checked={printAllTicketsSeparate}
              onCheckedChange={(checked) => {
                setPrintAllTicketsSeparate(checked as boolean);
                const newOptions = cart.reduce(
                  (acc, item) => {
                    acc[item.item.id!] = {
                      isTakeout:
                        itemOptions?.[item.item.id!]?.isTakeout || false,
                      printSeparateTickets: (checked as boolean) || false,
                    };
                    return acc;
                  },
                  {} as {
                    [key: string]: {
                      isTakeout: boolean;
                      printSeparateTickets: boolean;
                    };
                  },
                );
                setItemOptions(newOptions);
              }}
            />
            <Label htmlFor="print">
              Stampa <strong>tutti</strong> tickets separati
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isTakeout"
              checked={isAllOrderTakeout}
              onCheckedChange={(checked) => {
                setIsAllOrderTakeout(checked as boolean);
                const newOptions = cart.reduce(
                  (acc, item) => {
                    acc[item.item.id!] = {
                      isTakeout: checked as boolean,
                      printSeparateTickets:
                        itemOptions?.[item.item.id!]?.printSeparateTickets ||
                        false,
                    };
                    return acc;
                  },
                  {} as {
                    [key: string]: {
                      isTakeout: boolean;
                      printSeparateTickets: boolean;
                    };
                  },
                );
                setItemOptions(newOptions);
              }}
            />
            <Label htmlFor="isTakeout">
              Asporto <strong>tutto</strong> l&apos;ordine
            </Label>
          </div>
        </div>
        <div className="flex gap-4">
          <Change totalPrice={totalPrice.toFixed(2)} />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="flex flex-col gap-2 items-start">
            <Button
              className="w-full text-xl py-8"
              disabled={isSubmitting || cart.length === 0}
              onClick={() => saveOrder(true)}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                "Stampa ordine"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function OrderInterface() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [itemOptions, setItemOptions] = useState<
    | { [key: string]: { isTakeout: boolean; printSeparateTickets: boolean } }
    | undefined
  >();

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
        );
      }
      return prev.filter((i) => i.item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.item.id !== itemId);
      }
      return prev.map((i) => (i.item.id === itemId ? { ...i, quantity } : i));
    });
  };

  const totalPrice = cart.reduce(
    (acc, val) => acc + val.item.price * val.quantity,
    0,
  );

  const menu = useLiveQuery(() => db.menu_items.toArray()) || [];

  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <MenuList menu={menu} addToCart={addToCart} />
      {/* Cart Side */}
      <OrderActionsBar
        cart={cart}
        totalPrice={totalPrice}
        itemOptions={itemOptions}
        setItemOptions={setItemOptions}
        setCart={setCart}
      />
      <Cart
        cart={cart}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        itemOptions={itemOptions}
        setItemOptions={setItemOptions}
      ></Cart>
      <div className="w-full flex flex-col gap-4 max-w-xs rounded-md overflow-hidden border border-slate-200">
        <ScannerComponent menu={menu} setCart={setCart} />
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 300,
            width: "100%",
          }}
        >
          <QRCode
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={cart.length > 0 ? CartQRCodec.encode(cart) : ""}
            viewBox={`0 0 256 256`}
          />
        </div>
      </div>
    </div>
  );
}
