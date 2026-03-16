import Dexie, { type Table } from "dexie";
import { MenuItem, Order, OrderItem, MenuItemTypes } from "./types";
import menuData from "../data/menu.json";

export class MyDatabase extends Dexie {
  menu_items!: Table<MenuItem>;
  orders!: Table<Order>;
  order_items!: Table<OrderItem>;

  constructor() {
    super("ValmoCassaDB");
    this.version(1).stores({
      menu_items: "++id, name, type",
      orders: "id, created_at",
      order_items: "++id, order_id, [order_id+menu_item_id], menu_item_id",
    });
  }
}

export const db = new MyDatabase();

// Seeding logic
export async function seedDatabase() {
  const count = await db.menu_items.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.menu_items.bulkAdd(
    menuData.map((item) => ({
      ...item,
      id: item.id.toString(),
      created_at: now,
      visible: true,
    })) as MenuItem[],
  );
}

export async function generateUniqueId(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed easily confused chars like 0, 1, I, O
  let isUnique = false;
  let newId = "";

  while (!isUnique) {
    newId = "";
    for (let i = 0; i < 4; i++) {
      newId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await db.menu_items.get(newId);
    if (!existing) isUnique = true;
  }

  return newId;
}

export async function addMenuItem(item: {
  name: string;
  price: number;
  type: MenuItemTypes;
}): Promise<string> {
  const nextId = await generateUniqueId();
  const now = new Date().toISOString();
  await db.menu_items.add({
    id: nextId,
    ...item,
    created_at: now,
    visible: true,
  } as MenuItem);
  return nextId;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await db.menu_items.delete(id);
}

export async function deleteOrder(id: string): Promise<void> {
  await db.transaction("rw", [db.orders, db.order_items], async () => {
    await db.orders.delete(id);
    await db.order_items.where("order_id").equals(id).delete();
  });
}

export async function toggleMenuItemVisibility(id: string): Promise<void> {
  const item = await db.menu_items.get(id);
  if (item) {
    await db.menu_items.update(id, { visible: !item.visible });
  }
}
