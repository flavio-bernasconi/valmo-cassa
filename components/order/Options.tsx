"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field } from "@/components/ui/field";
import { ScissorsLineDashedIcon } from "lucide-react";

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
          value="takeout"
          aria-label="takeout"
          className="flex mr-2 flex-col items-center justify-center rounded-sm data-[state=on]:bg-slate-700 data-[state=on]:text-white"
        >
          <span className="text-xs">Asporto</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          title="Stampa i biglietti separatamente"
          value="separate"
          aria-label="separate"
          className="flex mr-2 size-8 flex-col items-center justify-center rounded-sm data-[state=on]:bg-slate-700 data-[state=on]:text-white"
        >
          <ScissorsLineDashedIcon className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </Field>
  );
}
