import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  // Delete old images and recreate
  if (body.images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: params.id } });
  }
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: body.name,
      category: body.category,
      price: Number(body.price),
      moq: Number(body.moq),
      rating: Number(body.rating),
      reviews: Number(body.reviews),
      color: body.color,
      image: body.image,
      imageUrl: body.imageUrl ?? null,
      desc: body.desc,
      images: body.images?.length
        ? { create: body.images.map((url: string, i: number) => ({ url, order: i })) }
        : undefined,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
