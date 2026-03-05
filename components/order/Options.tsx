"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field } from "@/components/ui/field";
import { ScissorsLineDashedIcon, ShoppingBagIcon } from "lucide-react";

export function OptionCartItem({
  itemOptions,
  setItemOptions,
}: {
  itemOptions?: { isTakeout: boolean; printSeparateTickets: boolean };
  setItemOptions: React.Dispatch<
    React.SetStateAction<
      { isTakeout: boolean; printSeparateTickets: boolean } | undefined
    >
  >;
}) {
  const activeOptions = [];
  if (itemOptions?.isTakeout) activeOptions.push("takeout");
  if (itemOptions?.printSeparateTickets) activeOptions.push("separate");

  return (
    <Field>
      <ToggleGroup
        type="multiple"
        value={activeOptions}
        onValueChange={(value) =>
          setItemOptions({
            isTakeout: value.includes("takeout"),
            printSeparateTickets: value.includes("separate"),
          })
        }
        variant="outline"
        spacing={3}
      >
        <ToggleGroupItem
          title="Ordine d'asporto"
          value="takeout"
          aria-label="takeout"
          className="flex size-6 mr-2 flex-col items-center justify-center rounded-sm data-[state=on]:bg-slate-700 data-[state=on]:text-white"
        >
          <ShoppingBagIcon className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          title="Stampa i biglietti separatamente"
          value="separate"
          aria-label="separate"
          className="flex size-6 mr-2 flex-col items-center justify-center rounded-sm data-[state=on]:bg-slate-700 data-[state=on]:text-white"
        >
          <ScissorsLineDashedIcon className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}
