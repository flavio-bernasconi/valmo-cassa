import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { OrderInterface } from "@/components/order-interface";

export type MenuItemTypes =
  | "bar"
  | "primi"
  | "secondi"
  | "contorni"
  | "dolci"
  | "varie";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  type: MenuItemTypes;
  created_at: string;
};

async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return null;
}

async function MenuDataFetcher() {
  const supabase = await createClient();
  const { data: menu, error } = await supabase
    .from("menu_2026")
    .select("*")
    .order("type", { ascending: true });

  if (error) {
    return (
      <div className="text-red-500">
        Errore nel recupero del menu: {error.message}
      </div>
    );
  }

  if (!menu || menu.length === 0) {
    return <div className="text-muted-foreground">Il menu è vuoto.</div>;
  }

  return <OrderInterface menu={menu} />;
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12 ">
      <div className="flex flex-col gap-4 items-start w-full">
        <Suspense fallback={<div>Caricamento menu...</div>}>
          <MenuDataFetcher />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <UserDetails />
      </Suspense>
    </div>
  );
}
