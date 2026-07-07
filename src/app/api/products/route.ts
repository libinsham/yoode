import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name)
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });

  const product = await prisma.product.create({
    data: {
      name: body.name,
      category: body.category || "Uncategorized",
      price: Number(body.price) || 0,
      moq: Number(body.moq) || 1,
      rating: Number(body.rating) || 4.5,
      reviews: Number(body.reviews) || 0,
      color: body.color || "#16181D",
      image: body.image || "tshirt",
      imageUrl: body.imageUrl || null,
      desc: body.desc || "",
      images: body.images?.length
        ? { create: body.images.map((url: string, i: number) => ({ url, order: i })) }
        : undefined,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(product, { status: 201 });
}
