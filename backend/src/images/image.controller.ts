import { Request, Response } from "express";
import * as service from "./image.service";
import { updateImageSchema } from "./image.validation";
import { z } from "zod";

// Validation des champs texte du form-data (hors fichier)
const createImageBodySchema = z.object({
    productId: z.string().min(1),
    alt: z.string().optional(),
    position: z.coerce.number().int().min(0), // coerce car form-data = string
    optionValueId: z.string().optional(),
});

export async function createImage(req: Request, res: Response) {
    // req.file est injecté par multer (upload.middleware.ts)
    if (!req.file) {
        return res.status(400).json({ message: "IMAGE_FILE_REQUIRED" });
    }

    try {
        const body = createImageBodySchema.parse(req.body);
        const image = await service.uploadAndCreateImage({
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            productId: body.productId,
            alt: body.alt,
            position: body.position,
            optionValueId: body.optionValueId,
        });
        res.status(201).json(image);
    } catch (e: any) {
        const status =
            e.message === "CLOUDINARY_UPLOAD_FAILED"
                ? 502
                : e.message === "IMAGE_DB_SAVE_FAILED"
                  ? 500
                  : 400;
        res.status(status).json({ message: e.message });
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
