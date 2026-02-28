"use client";

import { useEffect, useState } from "react";
import { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MenuList } from "./menu/MenuList";
import { Cart } from "./order/Cart";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { db, seedDatabase } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

export function OrderInterface() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printAllTicketsSeparate, setPrintAllTicketsSeparate] = useState(false);
  const [isAllOrderTakeout, setIsAllOrderTakeout] = useState(false);
  const router = useRouter();
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

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Save order to Dexie
      const orderId = await db.transaction(
        "rw",
        [db.orders, db.order_items],
        async () => {
          const id = await db.orders.add({
            total_price: totalPrice,
            created_at: new Date().toISOString(),
          });

          const orderItems = cart.map((i) => ({
            order_id: id as string,
            menu_item_id: i.item.id!,
            quantity: i.quantity,
            price_at_time: i.item.price,
            is_takeout: itemOptions?.[i.item.id!]?.isTakeout || false,
          }));

          await db.order_items.bulkAdd(orderItems);
          return id;
        },
      );

      // 2. Call Print API
      const printItems = cart.map((i) => ({
        name: i.item.name,
        quantity: i.quantity,
        price: i.item.price,
        type: i.item.type,
        isTakeout: itemOptions?.[i.item.id!]?.isTakeout || false,
        printSeparateTickets:
          itemOptions?.[i.item.id!]?.printSeparateTickets || false,
      }));

      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.toString(),
          items: printItems,
          printAllTicketsSeparate,
          isAllOrderTakeout,
        }),
      });

      const result = await response.json();

      // if (!result.success) {
      //   throw new Error(result.message);
      // }

      setCart([]);
      toast.success("Ordine inviato con successo!", {
        description: new Date().toLocaleString("it-IT"),
      });
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Qualcosa è andato storto.",
      );
      toast.error("Errore durante l&apos;invio dell&apos;ordine!", {
        description: new Date().toLocaleString("it-IT"),
      });
      // rollback remove last order if throw an error
      await db.transaction("rw", [db.orders, db.order_items], async () => {
        const lastOrder = await db.orders.toCollection().last();
        if (lastOrder) {
          await db.orders.delete(lastOrder.id!);
          await db.order_items.where({ order_id: lastOrder.id! }).delete();
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

    if (checkAreAllTakeout) {
      setIsAllOrderTakeout(true);
    } else {
      setIsAllOrderTakeout(false);
    }
    if (checkAreAllPrintSeparateTickets) {
      setPrintAllTicketsSeparate(true);
    } else {
      setPrintAllTicketsSeparate(false);
    }
  }, [itemOptions, cart.length]);

  return (
    <div className="flex gap-8 w-full">
      <MenuList menu={menu} addToCart={addToCart} />
      {/* Cart Side */}
      <Cart
        cart={cart}
        removeFromCart={removeFromCart}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        clearCart={() => {
          setCart([]);
        }}
        itemOptions={itemOptions}
        setItemOptions={setItemOptions}
      >
        <div className="border-t pt-4 mt-2 flex justify-between items-center text-2xl font-bold">
          <span>Totale</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <div className="flex items-center gap-2">
          <Checkbox
            id="print"
            checked={printAllTicketsSeparate}
            onCheckedChange={(checked) => {
              setPrintAllTicketsSeparate(checked as boolean);
              const newOptions = cart.reduce(
                (acc, item) => {
                  acc[item.item.id!] = {
                    isTakeout: itemOptions?.[item.item.id!]?.isTakeout || false,
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
        <Button
          className="w-full mt-4 text-xl py-8"
          disabled={isSubmitting}
          onClick={handleSubmit}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            "Conferma Ordine"
          )}
        </Button>
      </Cart>
    </div>
  );
}
