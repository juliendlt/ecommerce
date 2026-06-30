import { Request, Response } from "express";
import * as service from "./option.service";
import { createOptionSchema, updateOptionSchema } from "./option.validation";
import { z } from "zod";

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

// ─── Attach : lie une ou plusieurs options à un produit, dans un groupe ───
const attachSchema = z.object({
    productId: z.string().min(1),
    position: z.number().int().min(0),
    optionValueIds: z.array(z.string().min(1)).min(1),
});

export async function attachOption(req: Request, res: Response) {
    try {
        const data = attachSchema.parse(req.body);
        const group = await service.attachOptionsToProduct(
            data.productId,
            data.position,
            data.optionValueIds,
        );
        res.status(201).json(group);
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}

// ─── Supprime un groupe d'options d'un produit (pas les OptionValue elles-mêmes) ───
export async function deleteOptionGroup(req: Request, res: Response) {
    try {
        await service.deleteProductOptionGroup(req.params.groupId);
        res.json({ message: "OPTION_GROUP_DELETED" });
    } catch (e: any) {
        res.status(400).json({ message: e.message });
    }
}
