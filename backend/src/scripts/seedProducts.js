import dotenv from "dotenv";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Shop } from "../models/shop.model.js";

dotenv.config({ path: "./src/.env" });

const SHOP_ID = process.env.SEED_SHOP_ID || process.env.SHOP_ID;
const MONGO_URI = process.env.MONGO;

const categories = [
  "fertilizer",
  "insecticide (sucking)",
  "insecticide (chewing)",
  "pesticide",
  "fungicide",
];

const tagsPool = ["fast", "seasonal", "liquid", "granular", "organic", "premium"];

const randomPick = (list) => list[Math.floor(Math.random() * list.length)];

const buildProducts = (count = 100) => {
  const products = [];
  for (let i = 1; i <= count; i += 1) {
    const category = randomPick(categories);
    const sprayCount = randomPick([2, 5, 10, 20]);
    const price = 100 + i * 5;
    const cost = Math.max(40, price - 20);
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6 + (i % 12));

    products.push({
      title: `${category} product ${i}`,
      description: `Sample ${category} product ${i} for demo seeding`,
      category,
      sprayCount,
      costPrice: String(cost),
      sellingPrice: price,
      tags: [randomPick(tagsPool), randomPick(tagsPool)],
      expiryDate: expiry,
      quantity: 10 + (i % 30),
      shopId: SHOP_ID,
    });
  }
  return products;
};

const run = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO env value");
  }
  if (!SHOP_ID) {
    throw new Error("Missing SEED_SHOP_ID (or SHOP_ID) env value");
  }

  await mongoose.connect(MONGO_URI);

  const shopExists = await Shop.exists({ _id: SHOP_ID });
  if (!shopExists) {
    throw new Error(`Shop not found for ID ${SHOP_ID}`);
  }

  const products = buildProducts(100);
  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products for shop ${SHOP_ID}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  mongoose.disconnect();
  process.exit(1);
});
