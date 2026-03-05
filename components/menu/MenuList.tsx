"use client";

import { MenuItem } from "@/lib/types";
import { MAPPED_TYPES, MENU_SORTING_KEY } from "@/lib/constant";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useHotkey } from "@tanstack/react-hotkeys";

interface SortableMenuItemProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

function SortableMenuItem({ item, onClick }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderTop: `8px solid ${MAPPED_TYPES[item.type].color}`,
    borderBottom: `8px solid ${MAPPED_TYPES[item.type].color}`,
    backgroundColor: MAPPED_TYPES[item.type].color,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative min-w-24 max-w-36 h-24 flex flex-col justify-between p-3 border rounded-md bg-card transition-shadow hover:shadow-md group text-left ${
        isDragging ? "shadow-xl ring-2 ring-primary/20" : ""
      }`}
    >
      <button
        onClick={() => onClick(item)}
        className="flex-1 text-left flex flex-col justify-start gap-1"
      >
        <span className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {item.name}
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          €{item.price.toFixed(2)}
        </span>
      </button>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-1 right-1 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
        title="Trascina per ordinare"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
}

export const MenuList = ({
  menu,
  addToCart,
}: {
  menu: MenuItem[];
  addToCart: (item: MenuItem) => void;
}) => {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  // Load order from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem("menu_item_order");
    if (savedOrder) {
      try {
        setOrderedIds(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to parse menu order from localStorage", e);
      }
    }
  }, []);

  // Sort menu items based on saved order, then by their default order for new items
  const sortedItems = useMemo(() => {
    const visibleMenu = menu.filter(
      (item) => !("visible" in item) || item.visible,
    );

    // If no custom order, return filtered menu
    if (orderedIds.length === 0)
      return visibleMenu.sort((a, b) => {
        return (
          MENU_SORTING_KEY.indexOf(a.type) - MENU_SORTING_KEY.indexOf(b.type)
        );
      });

    // Create a map for quick lookup of items by ID
    const itemMap = new Map(visibleMenu.map((item) => [item.id, item]));

    // Start with items in the saved order
    const sorted: MenuItem[] = [];
    const seenIds = new Set<string>();

    orderedIds.forEach((id) => {
      const item = itemMap.get(id);
      if (item) {
        sorted.push(item);
        seenIds.add(id);
      }
    });

    // Append any new items that weren't in the saved order
    visibleMenu.forEach((item) => {
      if (!seenIds.has(item.id)) {
        sorted.push(item);
      }
    });

    return sorted;
  }, [menu, orderedIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require dragging 8px before activation to allow clicks
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over.id);

      const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);
      const newIds = newSortedItems.map((item) => item.id);

      setOrderedIds(newIds);
      localStorage.setItem("menu_item_order", JSON.stringify(newIds));
    }
  };

  const panelRef = useRef<HTMLDivElement>(null);

  // This hotkey only fires when the panel (or its children) has focus
  // useHotkey("Mod+S", () => console.log("heeeyoooooo"), { target: panelRef });

  return (
    <div className="flex flex-col relative w-full" ref={panelRef} tabIndex={0}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-10">
          <SortableContext items={sortedItems} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap gap-2">
              {sortedItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onClick={addToCart}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};
