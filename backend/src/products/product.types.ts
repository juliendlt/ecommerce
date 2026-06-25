export type CreateProductInput = {
    name: string;
    slug: string;
    shortDescription?: string;
    description?: string;
    basePrice: number;
    categoryId: string;
};


export type UpdateProductInput = Partial<CreateProductInput> & { isActive?: boolean; };