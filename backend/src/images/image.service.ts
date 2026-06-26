import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/prisma";
import { UpdateImageInput } from "./image.types";

// Cloudinary se configure via les variables d'environnement automatiquement :
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

function uploadToCloudinary(
    buffer: Buffer,
    mimetype: string,
): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "tatafil/products",
                resource_type: "image",
                format: mimetype === "image/webp" ? "webp" : "auto",
                transformation: [
                    { width: 1200, crop: "limit" }, // jamais plus large que 1200px
                    { quality: "auto:good" }, // compression automatique
                ],
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error ?? new Error("CLOUDINARY_UPLOAD_FAILED"));
                }
                resolve({ url: result.secure_url, publicId: result.public_id });
            },
        );
        stream.end(buffer);
    });
}

export async function uploadAndCreateImage(data: {
    buffer: Buffer;
    mimetype: string;
    productId: string;
    alt?: string;
    position: number;
    optionValueId?: string;
}) {
    // 1. Upload sur Cloudinary
    let cloudinaryResult: { url: string; publicId: string };
    try {
        cloudinaryResult = await uploadToCloudinary(data.buffer, data.mimetype);
    } catch (err) {
        console.error("[image] Cloudinary upload failed:", err);
        throw new Error("CLOUDINARY_UPLOAD_FAILED");
    }

    // 2. Sauvegarder l'URL en base — si ça échoue on logue l'URL orpheline
    try {
        return await prisma.productImage.create({
            data: {
                url: cloudinaryResult.url,
                alt: data.alt,
                position: data.position,
                product: { connect: { id: data.productId } },
                ...(data.optionValueId && {
                    optionValue: { connect: { id: data.optionValueId } },
                }),
            },
        });
    } catch (err) {
        console.error(
            `[image] CRITICAL: image uploaded to Cloudinary (${cloudinaryResult.publicId}) but DB save failed:`,
            err,
        );
        throw new Error("IMAGE_DB_SAVE_FAILED");
    }
}

export async function getProductImages(productId: string) {
    return prisma.productImage.findMany({
        where: { productId },
        include: { optionValue: true },
        orderBy: { position: "asc" },
    });
}

export async function updateImage(id: string, data: UpdateImageInput) {
    return prisma.productImage.update({ where: { id }, data });
}

export async function deleteImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
}
