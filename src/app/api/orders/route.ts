import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, phone, address, items } = body;

  if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const total = items.reduce((s: number, i: any) => s + i.total, 0);

  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      address,
      total,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          name: i.name,
          color: i.color,
          size: i.size,
          printType: i.printType,
          qty: i.qty,
          unitPrice: i.unitPrice,
          total: i.total,
          logo: i.logo || null,
          image: i.image,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
