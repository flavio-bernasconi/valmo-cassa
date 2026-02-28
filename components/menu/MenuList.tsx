import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { MenuItem, MenuItemTypes } from "@/lib/types";
import { MAPPED_TYPES } from "@/lib/constant";

export const MenuList = ({
  menu,
  addToCart,
}: {
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 relative w-full">
      <div className="sticky top-16 z-10 py-3 bg-slate-200 rounded-lg backdrop-blur border-b -mx-2 px-4 flex gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cerca un prodotto..."
            className="pl-10 bg-white border-white/20  placeholder:text-slate-400 focus-visible:ring-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {Object.keys(MAPPED_TYPES).map((type) => {
            const count = filteredMenu.filter((m) => m.type === type).length;
            if (count === 0) return null;
            return (
              <Button
                key={type}
                variant="secondary"
                size="sm"
                className="capitalize shrink-0"
                asChild
              >
                <a href={`#category-${type}`}>{type}</a>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-10 ">
        {(Object.keys(MAPPED_TYPES) as MenuItemTypes[]).map((type) => {
          const items = filteredMenu.filter((m) => m.type === type);
          if (items.length === 0) return null;

          return (
            <section
              key={type}
              id={`category-${type}`}
              className="flex flex-col gap-4 scroll-mt-32"
            >
              <h4 className="text-lg font-bold capitalize border-l-4 border-primary pl-3">
                {type}
              </h4>
              <div className="grid grid-cols-5 gap-4">
                {items.map((item) => (
                  <button
                    onClick={() => addToCart(item)}
                    key={item.id}
                    style={{
                      borderTop: `8px solid ${MAPPED_TYPES[item.type].color}`,
                      borderBottom: `8px solid ${MAPPED_TYPES[item.type].color}`,
                    }}
                    className="flex flex-col justify-between p-3 border rounded-md bg-card transition-all hover:shadow-md group text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-md leading-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-md text-muted-foreground font-mono">
                        €{item.price.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
