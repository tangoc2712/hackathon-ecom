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
            take: 5
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

        const limit = Number(process.env.PRODUCTS_PER_PAGE) || 6;
        const skip = (Number(page) - 1) * limit;

        const where: any = {};

        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        if (category) {
            where.category_name = category;
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
