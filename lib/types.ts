export type MenuItemTypes =
  | "bar"
  | "primi"
  | "secondi"
  | "contorni"
  | "dolci"
  | "varie";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  type: MenuItemTypes;
  created_at: string;
  visible?: boolean;
}

export interface Order {
  id?: string;
  total_price: number;
  created_at: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  is_takeout: boolean;
}
