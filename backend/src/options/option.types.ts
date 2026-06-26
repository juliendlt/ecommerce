export type CreateOptionValueInput = {
    label: string;
    type: string;
    priceOffSet: number;
};

export type UpdateOptionValueInput = {
    label?: string;
    type?: string;
    priceOffSet?: number;
    isAvailable?: boolean;
};
