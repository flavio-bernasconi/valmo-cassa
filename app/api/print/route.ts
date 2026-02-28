import { NextResponse } from "next/server";
import { printOrderTicket, PrintItem } from "@/lib/printer";

export async function POST(request: Request) {
  try {
    const { orderId, items, printAllTicketsSeparate, isAllOrderTakeout } =
      await request.json();

    if (!orderId || !items) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    await printOrderTicket(
      orderId,
      items as PrintItem[],
      printAllTicketsSeparate,
      isAllOrderTakeout,
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Print API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
