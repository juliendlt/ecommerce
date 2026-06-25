import { prisma }
    from "../lib/prisma";


import cloudinary
    from "./cloudinary";



export async function uploadToCloudinary(
    file: Express.Multer.File
) {
    return new Promise<string>(
        (resolve, reject) => {
            const stream =
                cloudinary.uploader.upload_stream(
                    {
                        folder: "couture-products"
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        if (!result) {
                            reject(new Error("CLOUDINARY_UPLOAD_FAILED"));
                            return;

                        }
                        resolve(result.secure_url);
                    }
                );
            stream.end(file.buffer);

        });

}

export async function createProductImage(
    productId: string,
    url: string,
    optionValueId?: string
) {
    return prisma.productImage.create({
        data: {
            productId,
            url,
            optionValueId,
            position: 0
        },
        include: {
            optionValue: true
        }
    });
}

export async function getProductImages(
    productId: string
) {
    return prisma.productImage.findMany({
        where: {
            productId
        },
        include: {
            optionValue: true
        },
        orderBy: {
            position: "asc"
        }
    });
}

export async function deleteProductImage(
    id: string
) {

    const image =
        await prisma.productImage.findUnique({
            where: {
                id
            }
        });

    if (!image) {
        throw new Error("IMAGE_NOT_FOUND");
    }



    await prisma.productImage.delete({
        where: {
            id
        }
    });

    return {
        message: "IMAGE_DELETED"
    };
}