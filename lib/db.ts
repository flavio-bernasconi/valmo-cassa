import Dexie, { type Table } from "dexie";
import { MenuItem, Order, OrderItem, MenuItemTypes } from "./types";

export class MyDatabase extends Dexie {
  menu_items!: Table<MenuItem>;
  orders!: Table<Order>;
  order_items!: Table<OrderItem>;

  constructor() {
    super("ValmoCassaDB");
    this.version(1).stores({
      menu_items: "++id, name, type",
      orders: "id, created_at",
      order_items:
        "++id, order_id, [order_id+menu_item_id], menu_item_id",
    });
  }
}

export const db = new MyDatabase();

// Seeding logic
export async function seedDatabase() {
  const count = await db.menu_items.count();
  if (count > 0) return;

  const initialMenu: { name: string; price: number; type: MenuItemTypes }[] = [
    { name: "Gadget", price: 2, type: "varie" as MenuItemTypes },
    { name: "Maglietta GGV", price: 7, type: "varie" as MenuItemTypes },
    { name: "3 Maglie GGV", price: 15, type: "varie" as MenuItemTypes },
    { name: "Acqua", price: 0.5, type: "bar" as MenuItemTypes },
    { name: "Bibita", price: 2, type: "bar" as MenuItemTypes },
    { name: "Caffè", price: 1, type: "bar" as MenuItemTypes },
    { name: "Vino 1 litro sfuso", price: 7, type: "bar" as MenuItemTypes },
    { name: "Vino bicchiere", price: 1, type: "bar" as MenuItemTypes },
    {
      name: "Bottiglia vino rosso Scariot",
      price: 12,
      type: "bar" as MenuItemTypes,
    },
    {
      name: "Bottiglia vino bianco Bel Buche",
      price: 10,
      type: "bar" as MenuItemTypes,
    },
    { name: "Birra artigianale", price: 3.5, type: "bar" as MenuItemTypes },
    { name: "Birra Moretti", price: 2.5, type: "bar" as MenuItemTypes },
    { name: "Birra Ichnusa", price: 3, type: "bar" as MenuItemTypes },
    {
      name: "Boccale birra artigianale",
      price: 10,
      type: "bar" as MenuItemTypes,
    },
    { name: "Boccale birra Moretti", price: 8, type: "bar" as MenuItemTypes },
    { name: "Boccale birra Ichnusa", price: 9, type: "bar" as MenuItemTypes },
    { name: "Gnocchi ragu", price: 4.5, type: "primi" as MenuItemTypes },
    { name: "Gnocchi boscaiola", price: 5, type: "primi" as MenuItemTypes },
    {
      name: "Gnocchi burro e salvia",
      price: 4,
      type: "primi" as MenuItemTypes,
    },
    { name: "Gnocchi pomodoro", price: 4, type: "primi" as MenuItemTypes },
    {
      name: "Gnocchi zola salsiccia",
      price: 5,
      type: "primi" as MenuItemTypes,
    },
    { name: "Trippa", price: 4.5, type: "primi" as MenuItemTypes },
    { name: "Coda alla vaccinara", price: 8, type: "primi" as MenuItemTypes },
    { name: "Gorgonzola", price: 2, type: "primi" as MenuItemTypes },
    {
      name: "Zuppa di cipolle con crostino",
      price: 4.5,
      type: "primi" as MenuItemTypes,
    },
    { name: "Dolci", price: 2, type: "dolci" as MenuItemTypes },
    { name: "Grigliata mista", price: 9, type: "secondi" as MenuItemTypes },
    { name: "Costine", price: 6, type: "secondi" as MenuItemTypes },
    { name: "Tomino", price: 3, type: "contorni" as MenuItemTypes },
    {
      name: "Tomino con verdure grigliate",
      price: 4.5,
      type: "contorni" as MenuItemTypes,
    },
    {
      name: "Panino con salamella",
      price: 3,
      type: "secondi" as MenuItemTypes,
    },
    {
      name: "Panino salamella + una verdura grigliata a scelta",
      price: 4,
      type: "secondi" as MenuItemTypes,
    },
    {
      name: "Panino salamella tomino + una verdura grigliata a scelta",
      price: 6.5,
      type: "secondi" as MenuItemTypes,
    },
    {
      name: "Panino salamella tomino",
      price: 6,
      type: "secondi" as MenuItemTypes,
    },
    {
      name: "Panino tomino + una verdura grigliata a scelta",
      price: 4.5,
      type: "secondi" as MenuItemTypes,
    },
    { name: "Peperoni grigliati", price: 0, type: "contorni" as MenuItemTypes },
    { name: "Cipolle grigliate", price: 0, type: "contorni" as MenuItemTypes },
    { name: "Sovracosce di pollo", price: 5, type: "secondi" as MenuItemTypes },
    { name: "Roast beef", price: 4.5, type: "secondi" as MenuItemTypes },
    { name: "Patate fritte", price: 3, type: "contorni" as MenuItemTypes },
    { name: "Fagioli", price: 2, type: "contorni" as MenuItemTypes },
    {
      name: "Fagioli con cipolle",
      price: 2,
      type: "contorni" as MenuItemTypes,
    },
    { name: "Fanta Insalata", price: 4, type: "contorni" as MenuItemTypes },
  ];

  const now = new Date().toISOString();
  await db.menu_items.bulkAdd(
    initialMenu.map((item) => ({ ...item, created_at: now })) as MenuItem[],
  );
}

export async function addMenuItem(item: {
  name: string;
  price: number;
  type: MenuItemTypes;
}): Promise<number> {
  const now = new Date().toISOString();
  return await db.menu_items.add({
    ...item,
    created_at: now,
  } as MenuItem);
}

export async function deleteMenuItem(id: number): Promise<void> {
  await db.menu_items.delete(id);
}

export async function deleteOrder(id: string): Promise<void> {
  await db.transaction("rw", [db.orders, db.order_items], async () => {
    await db.orders.delete(id);
    await db.order_items.where("order_id").equals(id).delete();
  });
}

