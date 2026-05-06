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
      menu_items: "id, name, type",
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

export async function addMenuItem(item: {
  id: string;
  name: string;
  price: number;
  type: MenuItemTypes;
}): Promise<string> {
  const normalizedId = item.id.trim().toUpperCase();
  if (!normalizedId) {
    throw new Error("ID is required");
  }
  const existing = await db.menu_items.get(normalizedId);
  if (existing) {
    throw new Error(`Menu item with id "${normalizedId}" already exists`);
  }

  const now = new Date().toISOString();
  await db.menu_items.add({
    ...item,
    id: normalizedId,
    created_at: now,
    visible: true,
  } as MenuItem);
  return normalizedId;
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
