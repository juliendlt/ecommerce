import { Request, Response } from "express";
import * as service from "./category.service";
import { createCategorySchema, updateCategorySchema } from "./category.validation";

export async function createCategory(req: Request, res: Response) {
    try {
        const data = createCategorySchema.parse(req.body);
        const category = await service.createCategory(data);
        res.status(201).json(category);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function getCategories(req: Request, res: Response) {
    const categories = await service.getCategories();
    res.json(categories);
}

export async function getCategory(req: Request, res: Response) {
    try {
        const category = await service.getCategoryBySlug(req.params.slug);
        res.json(category);
    } catch (e: any) {
        res.status(404).json({ message: e.message });
    }
}

export async function updateCategory(req: Request, res: Response) {
    try {
        const data = updateCategorySchema.parse(req.body);
        const category = await service.updateCategory(req.params.id, data);
        res.json(category);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function deleteCategory(req: Request, res: Response) {
    await service.deleteCategory(req.params.id);
    res.json({ message: "CATEGORY_DELETED" });
}
