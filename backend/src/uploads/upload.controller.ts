import { Request, Response } from "express";
import * as service from "./upload.service";



export async function uploadProductImage(
    req: Request,
    res: Response
) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: "IMAGE_REQUIRED"
            });
        }

        const { productId, optionValueId } = req.body;
        if (!productId) {
            return res.status(400).json({
                message: "PRODUCT_REQUIRED"
            });
        }

        const url = await service.uploadToCloudinary(file);
        const image = await service.createProductImage(productId, url, optionValueId);
        res.status(201).json(image);
    }
    catch (error: any) {
        res.status(400).json({
            message: error.message
        });
    }
}

export async function getImages(
    req: Request,
    res: Response
) {
    const images =
        await service.getProductImages(
            req.params.productId

        );
    res.json(images);
}

export async function deleteImage(

    req: Request,

    res: Response

) {
    try {
        const result = await service.deleteProductImage(req.params.id);
        res.json(result);
    }
    catch (error: any) {
        res.status(400).json({
            message: error.message
        });
    }
}