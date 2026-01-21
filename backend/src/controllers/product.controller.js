import {Shop} from '../models/shop.model.js';
import { Product } from '../models/product.model.js';
import {ApiError} from "../utils/ApiError.js"
import PDFDocument from "pdfkit";

const buildProductQuery = ({ shopId, search, category, sprayCount }) => {
      const query = { shopId };

      if (category && category !== "all") {
            query.category = category;
      }

      if (sprayCount !== undefined && sprayCount !== null && String(sprayCount).length > 0) {
            query.sprayCount = Number(sprayCount);
      }

      if (search) {
            const regex = new RegExp(search, "i");
            query.$or = [
                  { title: regex },
                  { description: regex }
            ];
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

      const errors={};

      if(!details?.title) errors.title="Title of product is required !";
      if(!details?.description) errors.description="Description of product is required !";
      if(!details?.costPrice) errors.costPrice="Cost Price  of product is required !";
      if(!details?.sellingPrice) errors.sellingPrice="Selling Price of product is required !";
      if(!details?.expiryDate) errors.expiryDate="Expiry date of product is required !";
      if(!details?.quantity) errors.quantity="Quantity of product is required !";

      if(Object.keys(errors).length>0) throw new ApiError(400,"All fields are required!",errors);


      await Product.create({...details,shopId}); 

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

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const query = buildProductQuery({
            shopId,
            search: req.query.search,
            category: req.query.category,
            sprayCount: req.query.sprayCount,
      });

      const [products, totalCount] = await Promise.all([
            Product.find(query).sort({ createdAt: -1 }).limit(limit).skip(offset),
            Product.countDocuments(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success:true,
        products,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
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

      const products = await Product.find(query).sort({ createdAt: -1 });

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

      const products = await Product.find(query).sort({ createdAt: -1 });

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
