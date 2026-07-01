import { Request, Response } from "express";
import * as service from "./product.service";
import { createProductSchema, updateProductSchema } from "./product.validation";

export async function createProduct(req: Request, res: Response) {
    try {
        const data = createProductSchema.parse(req.body);
        const product = await service.createProduct(data);
        res.status(201).json(product);
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
}

export async function getProducts(req: Request, res: Response) {
    const products = await service.getProducts();
    res.json(products);
}

// Admin uniquement — retourne tous les produits, actifs et désactivés
export async function getAllProductsAdmin(req: Request, res: Response) {
    const products = await service.getAllProductsAdmin();
    res.json(products);
}

export async function getProduct(req: Request, res: Response) {
    try {
        const product = await service.getProductBySlug(req.params.slug);
        res.json(product);
    } catch (e: any) {
        res.status(404).json({ message: e.message });
    }
}

export async function updateProduct(req: Request, res: Response) {
    try {
        const data = updateProductSchema.parse(req.body);
        const product = await service.updateProduct(req.params.id, data);
        res.json(product);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function deleteProduct(req: Request, res: Response) {
    await service.disableProduct(req.params.id);
    res.json({
        message: "PRODUCT_DISABLED",
    });
}
