import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Heart } from "lucide-react";
import { MenuItem, MenuItemTypes } from "@/lib/types";
import { MAPPED_TYPES } from "@/lib/constant";

const getItemKey = (item: MenuItem) =>
  item.id ?? `${item.name}-${item.type}`;

export const MenuList = ({
  menu,
  addToCart,
}: {
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>([]);

  const toggleFavorite = (item: MenuItem) => {
    const key = getItemKey(item);
    setFavoriteKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const favoriteItems = filteredMenu.filter((item) =>
    favoriteKeys.includes(getItemKey(item)),
  );
  const hasFavorites = favoriteItems.length > 0;

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
          {hasFavorites && (
            <Button
              key="favorites"
              variant="secondary"
              size="sm"
              className="shrink-0"
              asChild
            >
              <a href="#category-favorites">Preferiti</a>
            </Button>
          )}
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
        {hasFavorites && (
          <section
            key="favorites"
            id="category-favorites"
            className="flex flex-col gap-4 scroll-mt-32"
          >
            <h4 className="text-lg font-bold border-l-4 border-primary pl-3">
              Preferiti
            </h4>
            <div className="grid grid-cols-5 gap-4">
              {favoriteItems.map((item) => {
                const itemKey = getItemKey(item);
                const isFavorite = favoriteKeys.includes(itemKey);

                return (
                  <button
                    onClick={() => addToCart(item)}
                    key={itemKey}
                    style={{
                      borderTop: `8px solid ${MAPPED_TYPES[item.type].color}`,
                      borderBottom: `8px solid ${MAPPED_TYPES[item.type].color}`,
                    }}
                    className="flex flex-col justify-between p-3 border rounded-md bg-card transition-all hover:shadow-md group text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-md leading-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </span>
                        <span className="text-md text-muted-foreground font-mono">
                          €{item.price.toFixed(2)}
                        </span>
                      </div>
                      <span
                        role="button"
                        aria-pressed={isFavorite}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFavorite ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
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
                {items.map((item) => {
                  const itemKey = getItemKey(item);
                  const isFavorite = favoriteKeys.includes(itemKey);

                  return (
                    <button
                      onClick={() => addToCart(item)}
                      key={itemKey}
                      style={{
                        borderTop: `8px solid ${MAPPED_TYPES[item.type].color}`,
                        borderBottom: `8px solid ${MAPPED_TYPES[item.type].color}`,
                      }}
                      className="flex flex-col justify-between p-3 border rounded-md bg-card transition-all hover:shadow-md group text-left"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-md leading-tight group-hover:text-primary transition-colors">
                            {item.name}
                          </span>
                          <span className="text-md text-muted-foreground font-mono">
                            €{item.price.toFixed(2)}
                          </span>
                        </div>
                        <span
                          role="button"
                          aria-pressed={isFavorite}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFavorite ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
