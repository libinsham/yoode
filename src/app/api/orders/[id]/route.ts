import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

// Partial update — used by the admin panel to change order status, and
// optionally correct customer contact details.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  const data: Record<string, any> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.address !== undefined) data.address = body.address;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { items: true },
    });
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Failed to update order:", err);
    return NextResponse.json(
      { error: "Failed to update order. " + (err?.message || "Unknown server error.") },
      { status: 500 }
    );
  }
}
