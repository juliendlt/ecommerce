import { Request, Response } from "express";
import * as service from "./image.service";
import { createImageSchema, updateImageSchema } from "./image.validation";

export async function createImage(req: Request, res: Response) {
    try {
        const data = createImageSchema.parse(req.body);
        const image = await service.createImage(data);
        res.status(201).json(image);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function getImages(req: Request, res: Response) {
    const images = await service.getProductImages(req.params.productId);
    res.json(images);
}

export async function updateImage(req: Request, res: Response) {
    try {
        const data = updateImageSchema.parse(req.body);
        const image = await service.updateImage(req.params.id, data);
        res.json(image);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function deleteImage(req: Request, res: Response) {
    await service.deleteImage(req.params.id);
    res.json({ message: "IMAGE_DELETED" });
}
