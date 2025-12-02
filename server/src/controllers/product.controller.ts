import { Request, Response } from "express";
import prisma from "../config/prisma";
import { BaseQueryType, NewProductBody, SearchProductsQuery } from "../types/types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteImage } from "../utils/cloudinary";
import { faker } from "@faker-js/faker";

export const getLatestProducts = asyncHandler(
    async (req: Request, res: Response, next) => {

        const products = await prisma.product.findMany({
            orderBy: { created_at: 'desc' },
            take: 8
        });

        return res.status(200).json({
            success: true,
            products
        });
    }
)

export const getAllCategories = asyncHandler(
    async (req: Request, res: Response, next) => {

        const categories = await prisma.product.findMany({
            select: { category_name: true },
            distinct: ['category_name']
        });

        const categoryList = categories.map(c => c.category_name).filter(Boolean);

        return res.status(200).json({
            success: true,
            categories: categoryList
        });

    }
);

export const getAllProducts = asyncHandler(async (req: Request, res: Response, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy as string) : { id: '', desc: false };
    let orderBy: any = {};

    if (sortBy.id) {
        // Map frontend sort keys to DB columns if needed
        const sortKey = sortBy.id === 'price' ? 'price' : 'created_at'; 
        orderBy[sortKey] = sortBy.desc ? 'desc' : 'asc';
    }

    const totalProducts = await prisma.product.count();
    const products = await prisma.product.findMany({
        orderBy,
        skip,
        take: limit
    });

    return res.status(200).json({
        success: true,
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page
    });
});


export const getProductDetails = asyncHandler(
    async (req: Request, res: Response, next) => {

        const product = await prisma.product.findUnique({
            where: { product_id: req.params.id }
        });

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        return res.status(200).json({
            success: true,
            product
        });
    }
);

export const createNewProduct = asyncHandler(
    async (req: Request<{}, {}, NewProductBody>, res: Response, next) => {

        const { name, category, price, stock, description } = req.body;
        console.log(req.body);

        if (!name || !category || !price || !stock || !description) {
            return next(new ApiError(400, "Please fill all fields"));
        }

        const file = req.file;

        if (!file) {
            return next(new ApiError(400, "Please upload a photo"));
        }

        const product = await prisma.product.create({
            data: {
                name,
                category_name: category.toLowerCase(),
                description,
                price: Number(price),
                stock: Number(stock),
                photos: [file.path], // Storing single photo in array for now
                photo_public_id: file.filename,
                // Assuming 'photo' field in DB is not strictly needed if we use 'photos', 
                // but if we want to keep backward compat, we might need to adjust schema or logic.
                // For now, let's assume 'photos' array is the main one.
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    }
);

export const updateProduct = asyncHandler(
    async (req: Request, res: Response, next) => {
        const id = req.params.id;
        const { name, category, price, stock, description } = req.body;

        const product = await prisma.product.findUnique({
            where: { product_id: id }
        });

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        const file = req.file;
        let updateData: any = {};

        if (file) {
            // Delete the old image from Cloudinary
            if (product.photo_public_id) {
                await deleteImage(product.photo_public_id);
            }

            // Update the product with new image data
            updateData.photos = [file.path];
            updateData.photo_public_id = file.filename;
        }

        if (name) updateData.name = name;
        if (category) updateData.category_name = category.toLowerCase();
        if (price) updateData.price = Number(price);
        if (stock) updateData.stock = Number(stock);
        if (description) updateData.description = description;

        const updatedProduct = await prisma.product.update({
            where: { product_id: id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    }
);

export const searchProducts = asyncHandler(
    async (req: Request<{}, {}, {}, SearchProductsQuery>, res: Response, next) => {
        const { search, category, sort, price, page = '1' } = req.query;

        const limit = Number(process.env.PRODUCTS_PER_PAGE) || 8;
        const skip = (Number(page) - 1) * limit;

        const where: any = {};

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        if (category) {
            where.category_name = { equals: category, mode: 'insensitive' };
        }

        if (price) {
            const [min, max] = price.split(',').map(Number);
            where.price = {};
            if (min !== undefined) where.price.gte = min;
            if (max !== undefined) where.price.lte = max;
        }

        let orderBy: any = {};
        if (sort && sort !== 'relevance') {
            orderBy.price = sort === 'asc' ? 'asc' : 'desc';
        }

        const [products, totalProducts] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                take: limit,
                skip
            }),
            prisma.product.count({ where }),
        ]);

        const totalPage = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            success: true,
            products,
            totalPage,
        });
    }
);

export const deleteProduct = asyncHandler(
    async (req: Request, res: Response, next) => {

        const id = req.params.id;

        const product = await prisma.product.findUnique({
            where: { product_id: id }
        });

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // delete the photo from cloudinary
        if (product.photo_public_id) {
            await deleteImage(product.photo_public_id);
        }

        await prisma.product.delete({
            where: { product_id: id }
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
);

export const toggleFeaturedStatus = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { product_id: id }
        });

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // Toggle the featured status
        const updatedProduct = await prisma.product.update({
            where: { product_id: id },
            data: { featured: !product.featured }
        });

        return res.status(200).json({
            success: true,
            message: "Product featured status updated successfully",
            product: updatedProduct,
        });
    }
);

// Controller to get all featured products
export const getFeaturedProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const products = await prisma.product.findMany({
            where: { featured: true }
        });

        return res.status(200).json({
            success: true,
            products,
        });
    }
);

export const getRelatedProducts = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { id } = req.params;

        try {
            const product = await prisma.product.findUnique({
                where: { product_id: id }
            });

            if (!product) {
                return next(new ApiError(404, "Product not found"));
            }

            // Use raw query for vector similarity search
            // Cast price to float to ensure JSON serialization works
            const relatedProducts = await prisma.$queryRaw`
                SELECT 
                    product_id::text,
                    name,
                    price::float,
                    photos,
                    category_name,
                    product_url,
                    embedding OPERATOR(public.<=>) (SELECT embedding FROM public.product WHERE product_id = ${id}::uuid)::public.vector as distance 
                FROM public.product
                WHERE product_id != ${id}::uuid
                ORDER BY distance ASC 
                LIMIT 5;
            `;

            return res.status(200).json({
                success: true,
                products: relatedProducts
            });
        } catch (error: any) {
            console.error("Error fetching related products:", error);
            return next(new ApiError(500, `Internal Server Error fetching related products: ${error.message}`));
        }
    }
);

export const getSuggestedProducts = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { userId } = req.query;

        try {
            if (userId) {
                // 1. Try to find suggestions based on order history
                const userWithOrders = await prisma.user.findUnique({
                    where: { user_id: String(userId) },
                    include: {
                        orders: {
                            orderBy: { created_at: 'desc' },
                            take: 3,
                            include: {
                                orderItems: {
                                    take: 1
                                }
                            }
                        }
                    }
                });

                if (userWithOrders && userWithOrders.orders.length > 0) {
                    // Get the most recent product purchased
                    const lastOrder = userWithOrders.orders[0];
                    if (lastOrder.orderItems.length > 0 && lastOrder.orderItems[0].product_id) {
                        const lastProductId = lastOrder.orderItems[0].product_id;

                        // Find products similar to the last purchased product
                        const suggestedProducts: any[] = await prisma.$queryRaw`
                            SELECT 
                                p.product_id::text,
                                p.name,
                                p.price::float,
                                p.photos,
                                p.category_name,
                                p.product_url,
                                p.embedding OPERATOR(public.<=>) (SELECT embedding FROM public.product WHERE product_id = ${lastProductId}::uuid)::public.vector as distance 
                            FROM public.product p
                            WHERE p.product_id != ${lastProductId}::uuid AND p.embedding IS NOT NULL
                            ORDER BY distance ASC 
                            LIMIT 4;
                        `;

                        if (suggestedProducts.length > 0) {
                            return res.status(200).json({
                                success: true,
                                source: 'order_history',
                                products: suggestedProducts
                            });
                        }
                    }
                }

                // 2. Fallback: Check if user has embedding (legacy/direct user vector approach)
                // Check if user exists and has embedding using raw query since Prisma doesn't support selecting Unsupported types directly
                const userHasEmbedding: any[] = await prisma.$queryRaw`
                    SELECT 1 FROM public.user WHERE user_id = ${String(userId)}::uuid AND embedding IS NOT NULL
                `;

                // If user has embedding, use it for similarity search
                if (userHasEmbedding.length > 0) {
                    // Use raw query for vector similarity search based on user embedding
                    const suggestedProducts: any[] = await prisma.$queryRaw`
                        SELECT 
                            p.product_id::text,
                            p.name,
                            p.price::float,
                            p.photos,
                            p.category_name,
                            p.product_url,
                            p.embedding OPERATOR(public.<=>) (SELECT embedding FROM public.user WHERE user_id = ${String(userId)}::uuid)::public.vector as distance 
                        FROM public.product p
                        WHERE p.embedding IS NOT NULL
                        ORDER BY distance ASC 
                        LIMIT 4;
                    `;

                    if (suggestedProducts.length > 0) {
                        return res.status(200).json({
                            success: true,
                            source: 'user_embedding',
                            products: suggestedProducts
                        });
                    }
                }
            }

            // 3. Fallback: return featured products as suggestions
            const products = await prisma.product.findMany({
                where: { featured: true },
                take: 4
            });

            // If no featured products, return random products (latest for now)
            if (products.length === 0) {
                const randomProducts = await prisma.product.findMany({
                    take: 4,
                    orderBy: {
                        created_at: 'desc'
                    }
                });
                
                return res.status(200).json({
                    success: true,
                    source: 'latest',
                    products: randomProducts
                });
            }

            return res.status(200).json({
                success: true,
                source: 'featured',
                products
            });

        } catch (error: any) {
            console.error("Error fetching suggested products:", error);
            // Don't fail completely, try fallback if error was due to vector search issues
             const products = await prisma.product.findMany({
                where: { featured: true },
                take: 4
            });
             return res.status(200).json({
                success: true,
                products
            });
        }
    }
);
