import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize:
            5 * 1024 * 1024
    },
    fileFilter(
        req,
        file,
        callback
    ) {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {
            callback(null, true);
        }
        else {
            callback(
                new Error("INVALID_IMAGE_TYPE")
            );
        }
    }
});