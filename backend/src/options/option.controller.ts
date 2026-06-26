import { Request, Response } from "express";
import * as service from "./option.service";
import { createOptionSchema, updateOptionSchema } from "./option.validation";

export async function createOption(req: Request, res: Response) {
    try {
        const data = createOptionSchema.parse(req.body);
        const option = await service.createOptionValue(data);
        res.status(201).json(option);
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
}

export async function getOptions(req: Request, res: Response) {
    const options = await service.getOptions();
    res.json(options);
}

export async function updateOption(req: Request, res: Response) {
    try {
        const data = updateOptionSchema.parse(req.body);
        const option = await service.updateOptionValue(req.params.id, data);
        res.json(option);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

export async function deleteOption(req: Request, res: Response) {
    await service.disableOption(req.params.id);
    res.json({ message: "OPTION_DISABLED" });
}
