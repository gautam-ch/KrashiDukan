import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

// Z=0, O=1, T=2, R=3, F=4, I=5, S=6, C=7, E=8, N=9
const decodeCostPrice = (encodedStr) => {
    if (!encodedStr) return 0;
    const map = {
        'Z': 0, 'z': 0,
        'O': 1, 'o': 1,
        'T': 2, 't': 2,
        'R': 3, 'r': 3,
        'F': 4, 'f': 4,
        'I': 5, 'i': 5,
        'S': 6, 's': 6,
        'C': 7, 'c': 7,
        'E': 8, 'e': 8,
        'N': 9, 'n': 9
    };

    let decodedValue = "";
    for (const char of String(encodedStr)) {
        if (map[char] !== undefined) {
            decodedValue += map[char];
        } else if (!Number.isNaN(Number(char)) && char !== " ") {
            // Fallback for raw numbers if they somehow ended up in there
            decodedValue += char;
        } else if (char === ".") {
            decodedValue += char;
        }
    }
    const parsed = Number.parseFloat(decodedValue);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const getSalesAnalytics = async (req, res) => {
    const { shopId } = req.params;
    const { startDate, endDate } = req.query; // Optional filters

    // Fetch all orders for this shop
    let filter = { shopId };
    const createdAt = {};
    if (startDate) {
        const start = new Date(startDate);
        if (!Number.isNaN(start.getTime())) {
            start.setHours(0, 0, 0, 0);
            createdAt.$gte = start;
        }
    }
    if (endDate) {
        const end = new Date(endDate);
        if (!Number.isNaN(end.getTime())) {
            end.setHours(23, 59, 59, 999);
            createdAt.$lte = end;
        }
    }
    if (Object.keys(createdAt).length > 0) {
        filter.createdAt = createdAt;
    }

    const orders = await Order.find(filter)
        .populate("items.product", "costPrice title")
        .sort({ createdAt: 1 }) // Chronological order
        .lean();

    // Aggregators
    let totalSales = 0;
    let totalProfit = 0;

    const lastWeekSales = {};
    const last6MonthsSales = {};
    const monthWiseSales = {};
    const productStats = {};

    // Base date setups
    const today = new Date();
    const lastWeekDate = new Date();
    lastWeekDate.setDate(today.getDate() - 7);

    const last6MonthsDate = new Date();
    last6MonthsDate.setMonth(today.getMonth() - 6);

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const dayKey = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        
        let orderTotalSales = 0;
        let orderTotalProfit = 0;

        order.items.forEach(item => {
            const qty = item.quantity || 0;
            const price = item.price || 0;
            const sales = qty * price;
            
            // Decode cost price
            let itemCost = 0;
            if (item.product && item.product.costPrice) {
                itemCost = decodeCostPrice(item.product.costPrice);
            }
            
            const cost = qty * itemCost;
            const profit = sales - cost;

            orderTotalSales += sales;
            orderTotalProfit += profit;

            // Product stats
            const prodId = item.product ? item.product._id.toString() : 'unknown';
            const prodName = item.productName || (item.product ? item.product.title : 'Deleted Product');
            
            if (!productStats[prodId]) {
                productStats[prodId] = {
                    name: prodName,
                    quantity: 0,
                    sales: 0,
                    profit: 0
                };
            }
            productStats[prodId].quantity += qty;
            productStats[prodId].sales += sales;
            productStats[prodId].profit += profit;
        });

        totalSales += orderTotalSales;
        totalProfit += orderTotalProfit;

        // Month-wise
        if (!monthWiseSales[monthKey]) {
            monthWiseSales[monthKey] = { sales: 0, profit: 0 };
        }
        monthWiseSales[monthKey].sales += orderTotalSales;
        monthWiseSales[monthKey].profit += orderTotalProfit;

        // Last 6 months
        if (orderDate >= last6MonthsDate) {
            if (!last6MonthsSales[monthKey]) {
                last6MonthsSales[monthKey] = { sales: 0, profit: 0 };
            }
            last6MonthsSales[monthKey].sales += orderTotalSales;
            last6MonthsSales[monthKey].profit += orderTotalProfit;
        }

        // Last week
        if (orderDate >= lastWeekDate) {
            if (!lastWeekSales[dayKey]) {
                lastWeekSales[dayKey] = { sales: 0, profit: 0 };
            }
            lastWeekSales[dayKey].sales += orderTotalSales;
            lastWeekSales[dayKey].profit += orderTotalProfit;
        }
    });

    // Format results
    const sortedProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);
    const topProducts = sortedProducts.slice(0, 10); // Top 10 selling products

    const formatChartData = (obj, keyName) => {
        return Object.entries(obj).map(([key, value]) => ({
            [keyName]: key,
            sales: parseFloat(value.sales.toFixed(2)),
            profit: parseFloat(value.profit.toFixed(2))
        })).sort((a, b) => a[keyName].localeCompare(b[keyName]));
    };

    res.status(200).json({
        success: true,
        data: {
            total: {
                sales: parseFloat(totalSales.toFixed(2)),
                profit: parseFloat(totalProfit.toFixed(2))
            },
            lastWeek: formatChartData(lastWeekSales, "date"),
            last6Months: formatChartData(last6MonthsSales, "month"),
            monthWise: formatChartData(monthWiseSales, "month"),
            topProducts: topProducts
        }
    });
};