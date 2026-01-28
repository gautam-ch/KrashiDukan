import {Shop} from '../models/shop.model.js';
import { Product } from '../models/product.model.js';
import {ApiError} from "../utils/ApiError.js"
import PDFDocument from "pdfkit";
import mongoose from "mongoose";

const buildProductQuery = ({ shopId, search, title, category, sprayCount }) => {
      const query = { shopId };

      if (category && category !== "all") {
            query.category = category;
      }

      if (sprayCount !== undefined && sprayCount !== null && String(sprayCount).length > 0) {
            query.sprayCount = Number(sprayCount);
      }

      if (title) {
            const regex = new RegExp(title, "i");
            query.title = regex;
      } else if (search) {
            const tags = search.split(',').map(tag => tag.trim()).filter(Boolean);
            if (tags.length > 1) {
                  const tagQueries = tags.map(tag => ({ tags: new RegExp(tag, "i") }));
                  query.$or = [
                        ...tagQueries,
                        { title: new RegExp(search, "i") },
                        { contents: new RegExp(search, "i") },
                        { description: new RegExp(search, "i") },
                        { category: new RegExp(search, "i") },
                  ];
            } else {
                  const regex = new RegExp(search, "i");
                  query.$or = [
                        { title: regex },
                        { contents: regex },
                        { description: regex },
                        { category: regex },
                        { tags: regex }
                  ];
            }
      }

      return query;
};


export const addProduct =async(req,res)=>{
      const userId = req.userId;
      const shopId = req.params.shopId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");

      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");

      const details=req.body;

      if (!details?.contents && details?.description) {
            details.contents = details.description;
      }

      const errors={};

      if(!details?.title) errors.title="Title of product is required !";
      if(!details?.contents) errors.contents="Contents of product is required !";
      if(!details?.category) errors.category="Category of product is required !";
      if(details?.sprayCount === undefined || details?.sprayCount === null || details?.sprayCount === "") {
            errors.sprayCount="Spray count of product is required !";
      }
      if(!details?.costPrice) errors.costPrice="Cost Price  of product is required !";
      if(!details?.sellingPrice) errors.sellingPrice="Selling Price of product is required !";
      if(!details?.expiryDate) errors.expiryDate="Expiry date of product is required !";
      if(!details?.quantity) errors.quantity="Quantity of product is required !";
      if(!details?.tags || (Array.isArray(details.tags) && details.tags.length === 0)) {
            errors.tags="Specifications are required !";
      }

      if(Object.keys(errors).length>0) throw new ApiError(400,"All fields are required!",errors);

      const productDetails = {
            ...details,
            title: details.title.trim(),
            contents: details.contents.trim(),
            category: details.category.trim(),
            shopId,
            tags: details.tags.map(tag => tag.trim())
      };

      await Product.create(productDetails); 

      res.status(201).json({success:true,message:"Product created successfully"});

}

export const getProducts= async(req,res)=>{
      const shopId=req.params.shopId;
      const userId= req.userId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");


      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");

      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const cursor = req.query.cursor ? String(req.query.cursor) : null;
      const cursorId = req.query.cursorId ? String(req.query.cursorId) : null;
      const includeTotal = req.query.includeTotal === "true" || !cursor;

      const query = buildProductQuery({
            shopId,
            search: req.query.search,
            title: req.query.title,
            category: req.query.category,
            sprayCount: req.query.sprayCount,
      });
      let pagedQuery = query;
      let cursorDate = null;

      if (cursor && cursorId) {
            if (!mongoose.Types.ObjectId.isValid(cursorId)) {
                  throw new ApiError(400, "Invalid cursor id");
            }
            cursorDate = new Date(cursor);
            if (Number.isNaN(cursorDate.getTime())) {
                  throw new ApiError(400, "Invalid cursor date");
            }
            const keysetFilter = {
                  $or: [
                        { expiryDate: { $gt: cursorDate } },
                        { expiryDate: cursorDate, _id: { $gt: cursorId } }
                  ]
            };
            pagedQuery = { $and: [query, keysetFilter] };
      }

      const products = await Product.find(pagedQuery)
            .sort({ expiryDate: 1, _id: 1 })
            .limit(limit + 1);

      const hasNextPage = products.length > limit;
      const items = hasNextPage ? products.slice(0, limit) : products;
      const lastItem = items[items.length - 1];
      const nextCursor = hasNextPage && lastItem
            ? {
                  cursor: lastItem.expiryDate?.toISOString(),
                  cursorId: lastItem._id.toString()
            }
            : null;

      const pagination = {
            limit,
            hasNextPage,
            nextCursor,
      };

      if (includeTotal) {
            const totalCount = await Product.countDocuments(query);
            pagination.totalCount = totalCount;
      }

      res.status(200).json({
        success:true,
        products: items,
        pagination,
        message:"fetched products successfully"
      })

}

export const exportProductsCSV = async (req, res) => {
      const shopId = req.params.shopId;
      const userId = req.userId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");

      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");

      const query = buildProductQuery({
            shopId,
            search: req.query.search,
            category: req.query.category,
            sprayCount: req.query.sprayCount,
      });

      const products = await Product.find(query).sort({ expiryDate: -1, createdAt: -1 });

      const headers = ["title", "category", "sprayCount", "expiryDate", "quantity", "sellingPrice", "costPrice"];
      const rows = products.map((p) => ({
            title: p.title,
            category: p.category || "",
            sprayCount: p.sprayCount ?? "",
            expiryDate: p.expiryDate ? new Date(p.expiryDate).toISOString().split("T")[0] : "",
            quantity: p.quantity ?? "",
            sellingPrice: p.sellingPrice ?? "",
            costPrice: p.costPrice ?? "",
      }));

      const headerLine = headers.join(",");
      const body = rows
            .map((row) =>
                  headers
                        .map((h) => {
                              const cell = row[h] ?? "";
                              if (typeof cell === "string" && cell.includes(",")) {
                                    return `"${cell.replace(/"/g, '""')}"`;
                              }
                              return cell;
                        })
                        .join(",")
            )
            .join("\n");

      const csv = `${headerLine}\n${body}`;
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=products.csv");
      res.status(200).send(csv);
};

export const exportProductsPDF = async (req, res) => {
      const shopId = req.params.shopId;
      const userId = req.userId;

      if(!userId ) throw new ApiError(401,"Unauthorized user!");
      if(!shopId ) throw new ApiError(400,"Required Shop-ID");

      const shop =await Shop.findById(shopId);
      if(!shop) throw new ApiError(404,"Shop not found !");

      const isOwner = shop.owners.some(
            id => id.toString() === userId
        );
      if(!isOwner) throw new ApiError(403,"Forbidden");

      const query = buildProductQuery({
            shopId,
            search: req.query.search,
            category: req.query.category,
            sprayCount: req.query.sprayCount,
      });

      const products = await Product.find(query).sort({ expiryDate: -1, createdAt: -1 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

      const doc = new PDFDocument({ margin: 32, size: "A4" });
      doc.pipe(res);

      doc.fontSize(18).text("Products backup", { align: "center" });
      doc.moveDown(1);

      const columns = [
            { label: "Title", x: 32 },
            { label: "Category", x: 190 },
            { label: "Spray", x: 300 },
            { label: "Expiry", x: 350 },
            { label: "Qty", x: 430 },
            { label: "Price", x: 470 },
      ];

      const drawHeader = () => {
            doc.fontSize(10).fillColor("#111");
            columns.forEach((col) => {
                  doc.text(col.label, col.x, doc.y, { width: 120 });
            });
            doc.moveDown(0.8);
            doc.moveTo(32, doc.y).lineTo(560, doc.y).stroke();
      };

      drawHeader();

      let y = doc.y + 6;
      const rowHeight = 16;

      products.forEach((p) => {
            if (y > 740) {
                  doc.addPage();
                  drawHeader();
                  y = doc.y + 6;
            }

            const expiry = p.expiryDate ? new Date(p.expiryDate).toISOString().split("T")[0] : "";

            doc.fontSize(9).fillColor("#111");
            doc.text(p.title || "", columns[0].x, y, { width: 150 });
            doc.text(p.category || "", columns[1].x, y, { width: 100 });
            doc.text(p.sprayCount ?? "", columns[2].x, y, { width: 40 });
            doc.text(expiry, columns[3].x, y, { width: 70 });
            doc.text(p.quantity ?? "", columns[4].x, y, { width: 30 });
            doc.text(p.sellingPrice ?? "", columns[5].x, y, { width: 60 });

            y += rowHeight;
      });

      doc.end();
};

export const getProductById = async (req, res) => {
      const { shopId, productId } = req.params;
      const userId = req.userId;

      if (!userId) throw new ApiError(401, "Unauthorized user!");
      if (!shopId || !productId) throw new ApiError(400, "Required Shop-ID and Product-ID");

      const shop = await Shop.findById(shopId);
      if (!shop) throw new ApiError(404, "Shop not found!");

      const isOwner = shop.owners.some(id => id.toString() === userId);
      if (!isOwner) throw new ApiError(403, "Forbidden");

      const product = await Product.findOne({ _id: productId, shopId });
      if (!product) throw new ApiError(404, "Product not found!");

      res.status(200).json({ success: true, product, message: "Fetched product successfully" });
};

export const updateProduct = async (req, res) => {
      const { shopId, productId } = req.params;
      const userId = req.userId;
      const details = req.body;

      if (!userId) throw new ApiError(401, "Unauthorized user!");
      if (!shopId || !productId) throw new ApiError(400, "Required Shop-ID and Product-ID");

      const shop = await Shop.findById(shopId);
      if (!shop) throw new ApiError(404, "Shop not found!");

      const isOwner = shop.owners.some(id => id.toString() === userId);
      if (!isOwner) throw new ApiError(403, "Forbidden");

      const product = await Product.findOne({ _id: productId, shopId });
      if (!product) throw new ApiError(404, "Product not found!");

      const updatedProduct = await Product.findByIdAndUpdate(productId, details, { new: true });

      res.status(200).json({ success: true, product: updatedProduct, message: "Product updated successfully" });
};

export const deleteProduct = async (req, res) => {
      const { shopId, productId } = req.params;
      const userId = req.userId;

      if (!userId) throw new ApiError(401, "Unauthorized user!");
      if (!shopId || !productId) throw new ApiError(400, "Required Shop-ID and Product-ID");

      const shop = await Shop.findById(shopId);
      if (!shop) throw new ApiError(404, "Shop not found!");

      const isOwner = shop.owners.some(id => id.toString() === userId);
      if (!isOwner) throw new ApiError(403, "Forbidden");

      const product = await Product.findOne({ _id: productId, shopId });
      if (!product) throw new ApiError(404, "Product not found!");

      await Product.findByIdAndDelete(productId);

      res.status(200).json({ success: true, message: "Product deleted successfully" });
};
