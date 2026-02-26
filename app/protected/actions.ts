"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { printOrderTicket, PrintItem } from "@/lib/printer";
import { MenuItem } from "./page";

export type CartItemAction = {
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  is_takeout: boolean;
  print_separate_tickets: boolean;
};

export async function createOrder(
  cart: CartItemAction[],
  totalPrice: number,
  menu: MenuItem[],
  printAllTicketsSeparate: boolean,
  isAllOrderTakeout: boolean,
) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Devi essere loggato per ordinare.");
  }

  // 2. Insert the order
  const { data: order, error: orderError } = await supabase
    .from("orders_2026")
    .insert({
      user_id: user.id,
      total_price: totalPrice,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order error:", orderError);
    throw new Error("Errore durante il salvataggio dell'ordine.");
  }

  // 3. Insert order items
  const orderItems = cart.map((cartItem) => ({
    order_id: order.id,
    menu_item_id: cartItem.menu_item_id,
    quantity: cartItem.quantity,
    price_at_time: cartItem.price_at_time,
    is_takeout: cartItem.is_takeout,
  }));

  const { error: itemsError } = await supabase
    .from("order_items_2026")
    .insert(orderItems);

  if (itemsError) {
    console.error("Items error:", itemsError);
    throw new Error("Errore durante il salvataggio dei prodotti dell'ordine.");
  }

  // 4. Print the ticket
  const printItems: PrintItem[] = cart.map((cartItem) => {
    const menuItem = menu.find((m) => m.id === cartItem.menu_item_id);
    return {
      name: menuItem?.name || "Prodotto non trovato???",
      quantity: cartItem.quantity,
      price: menuItem?.price || 0,
      type: menuItem?.type || "varie",
      isTakeout: cartItem.is_takeout,
      printSeparateTickets: cartItem.print_separate_tickets,
    };
  });

  try {
    await printOrderTicket(
      order.id,
      printItems,
      printAllTicketsSeparate,
      isAllOrderTakeout,
    );
  } catch (printError) {
    console.error("Printing failed, rolling back order:", printError);

    // Rollback: delete the order from DB since printing failed
    // await supabase.from("orders_2026").delete().eq("id", order.id);

    // return {
    //   success: false,
    //   orderId: null,
    //   message: "Errore stampante: l'ordine NON è stato salvato.",
    // };
  }

  return { success: true, orderId: order.id };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/login");
}
