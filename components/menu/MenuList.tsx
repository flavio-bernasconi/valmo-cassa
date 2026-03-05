import { MenuItem } from "@/lib/types";
import { MAPPED_TYPES } from "@/lib/constant";

const getItemKey = (item: MenuItem) => item.id ?? `${item.name}-${item.type}`;

export const MenuList = ({
  menu,
  addToCart,
}: {
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}) => {
  return (
    <div className="flex flex-col gap-6 relative w-full">
      <div className="flex flex-col gap-10 ">
        <div className="flex flex-wrap gap-2">
          {menu.map((item) => {
            if ("visible" in item && !item.visible) return null;
            const itemKey = getItemKey(item);

            return (
              <button
                onClick={() => addToCart(item)}
                key={itemKey}
                style={{
                  borderTop: `8px solid ${MAPPED_TYPES[item.type].color}`,
                  borderBottom: `8px solid ${MAPPED_TYPES[item.type].color}`,
                  backgroundColor: MAPPED_TYPES[item.type].color,
                }}
                className="w-fit max-w-32 flex flex-col justify-between p-3 border rounded-md bg-card transition-all hover:shadow-md group text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm leading-[1em] group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      €{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
