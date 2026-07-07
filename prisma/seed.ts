import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = [
  { name: "Custom Printed T-Shirt", category: "T-Shirts", price: 199, moq: 10, rating: 4.8, reviews: 230, color: "#16181D", image: "tshirt", desc: "120 GSM combed cotton tee, ready for front or back prints." },
  { name: "Custom Polo T-Shirt", category: "Polos", price: 299, moq: 10, rating: 4.7, reviews: 180, color: "#1B5FB8", image: "polo", desc: "220 GSM pique polo with reinforced collar, great for embroidery." },
  { name: "Custom Hoodie", category: "Hoodies & Sweatshirts", price: 599, moq: 25, rating: 4.8, reviews: 165, color: "#2E6B3E", image: "hoodie", desc: "320 GSM fleece hoodie, kangaroo pocket, available in 6 colours." },
  { name: "Custom Vacuum Bottle", category: "Drinkware", price: 349, moq: 25, rating: 4.7, reviews: 98, color: "#1A1C20", image: "bottle", desc: "Double-wall stainless steel, keeps drinks hot/cold for 12 hrs." },
  { name: "Custom Laptop Backpack", category: "Bags", price: 699, moq: 25, rating: 4.8, reviews: 100, color: "#1A2A45", image: "backpack", desc: "Water-resistant 15-inch laptop backpack with padded straps." },
  { name: "Custom Notebook", category: "Stationery", price: 129, moq: 50, rating: 4.6, reviews: 75, color: "#23262C", image: "notebook", desc: "A5 hardbound notebook, 100 ruled pages, foil-stamped logo." },
  { name: "Custom Mug", category: "Drinkware", price: 149, moq: 25, rating: 4.6, reviews: 110, color: "#222428", image: "mug", desc: "Ceramic 330ml mug, dishwasher-safe print." },
  { name: "Custom Tote Bag", category: "Bags", price: 199, moq: 25, rating: 4.7, reviews: 140, color: "#EDE6D6", image: "tote", desc: "Heavy canvas tote, 12oz, reinforced stitched handles." },
  { name: "Custom Cap", category: "Tech Accessories", price: 199, moq: 25, rating: 4.7, reviews: 76, color: "#1A1C20", image: "cap", desc: "6-panel cotton cap with adjustable strap." },
  { name: "Custom Power Bank", category: "Tech Accessories", price: 899, moq: 10, rating: 4.8, reviews: 80, color: "#EFEFEF", image: "powerbank", desc: "10,000mAh power bank with dual USB-C output." },
  { name: "Premium Welcome Kit", category: "Welcome Kits", price: 999, moq: 10, rating: 4.8, reviews: 60, color: "#16181D", image: "kit", desc: "Notebook + pen + bottle + tag, boxed and ribbon-tied." },
  { name: "Custom Jacket", category: "Hoodies & Sweatshirts", price: 799, moq: 25, rating: 4.8, reviews: 88, color: "#1A2A45", image: "jacket", desc: "Quarter-zip fleece jacket, breathable lining." },
];

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Skipping seed — ${count} products already exist.`);
    return;
  }
  await prisma.product.createMany({ data: PRODUCTS });
  console.log(`Seeded ${PRODUCTS.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
