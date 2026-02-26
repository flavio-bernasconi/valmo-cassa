import { MenuItemTypes } from "@/app/protected/page";
import {
  ThermalPrinter,
  PrinterTypes,
  CharacterSet,
} from "node-thermal-printer";

export type PrintItem = {
  name: string;
  quantity: number;
  price: number;
  type: MenuItemTypes;
  isTakeout: boolean;
  printSeparateTickets: boolean;
};

export async function printOrderTicket(
  orderId: string,
  items: PrintItem[],
  printAllTicketsSeparate: boolean,
  isAllOrderTakeout: boolean,
) {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // ESC/POS is standard for Epson and many others
    interface: "/dev/usb/lp0", // Common path for USB printer on Linux/Mac
    characterSet: CharacterSet.PC858_EURO, // Support Euro symbol
    removeSpecialCharacters: false,
    lineCharacter: "=",
    width: 32, // Adjusted for standard 58mm or 80mm printers
  });

  const isConnected = await printer.isPrinterConnected();

  console.log({ isConnected });

  if (!isConnected) {
    throw new Error("Stampante non connessa.");
  }

  printer.alignCenter();
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println("ValmoFestival Tridi");
  printer.setTextNormal();
  printer.println("--------------------------------");
  printer.alignLeft();
  printer.println(`Ordine: ${orderId.substring(0, 8)}`);
  printer.println(`Ora: ${new Date().toLocaleTimeString("it-IT")}`);
  printer.println("--------------------------------");
  printer.newLine();

  // 1. Separate individual and groupable items
  const individualItems: PrintItem[] = [];
  const groupableItems: PrintItem[] = [];

  items.forEach((item) => {
    if (item.printSeparateTickets || printAllTicketsSeparate) {
      individualItems.push(item);
    } else {
      groupableItems.push(item);
    }
  });

  // 2. Print individual tickets
  individualItems.forEach((item) => {
    const effectiveIsTakeout = isAllOrderTakeout || item.isTakeout;
    for (let i = 0; i < item.quantity; i++) {
      printer.alignCenter();
      printer.setTextDoubleHeight();
      printer.println(item.type.toUpperCase());
      if (effectiveIsTakeout) {
        printer.setTextDoubleWidth();
        printer.println("ASPORTO");
      }
      printer.setTextNormal();
      printer.println("--------------------------------");
      printer.alignLeft();
      printer.println(`1x ${item.name}`);
      printer.alignRight();
      printer.println(`${item.type}`);
      printer.println("--------------------------------");
      printer.newLine();
      printer.cut();
    }
  });

  // 3. Group the rest by type AND effective takeout status
  const groups = groupableItems.reduce(
    (acc, item) => {
      const effectiveIsTakeout = isAllOrderTakeout || item.isTakeout;
      const key = `${item.type}_${effectiveIsTakeout ? "takeout" : "dinein"}`;
      if (!acc[key]) {
        acc[key] = {
          type: item.type,
          isTakeout: effectiveIsTakeout,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      { type: string; isTakeout: boolean; items: PrintItem[] }
    >,
  );

  // 4. Print grouped tickets
  Object.values(groups).forEach((group) => {
    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println(group.type.toUpperCase());
    if (group.isTakeout) {
      printer.setTextDoubleWidth();
      printer.println("ASPORTO");
    }
    printer.setTextNormal();
    printer.println("--------------------------------");

    group.items.forEach((item) => {
      printer.alignLeft();
      printer.println(`${item.quantity}x ${item.name}`);
      printer.alignRight();
      printer.println(`${item.type}`);
    });

    printer.println("--------------------------------");
    printer.newLine();
    printer.cut();
  });

  // Ticket di riepilogo finale (opzionale, ma utile per la cassa)
  // printer.alignCenter();
  // printer.setTextDoubleHeight();
  // printer.println("RIEPILOGO");
  // printer.setTextNormal();
  // printer.println(`Ordine: ${orderId.substring(0, 8)}`);
  // printer.println("--------------------------------");

  // items.forEach((item) => {
  //   printer.alignLeft();
  //   printer.println(`${item.quantity}x ${item.name}`);
  // });

  // printer.println("--------------------------------");
  // printer.alignRight();
  // printer.setTextDoubleHeight();
  // printer.println(`TOTALE: €${totalPrice.toFixed(2)}`);
  // printer.setTextNormal();
  // printer.newLine();
  // printer.alignCenter();
  // printer.println("Grazie per l'ordine!");
  // printer.cut();

  try {
    await printer.execute();
    console.log("Print job sent successfully.");
  } catch (error) {
    console.error("Print error:", error);
    throw new Error("Errore durante la stampa del biglietto.");
  }
}
