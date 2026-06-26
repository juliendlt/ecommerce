export type UpdateUserInput = {
    firstName?: string;
    lastName?: string;
    email?: string;
};

export type UpdatePasswordInput = {
    currentPassword: string;
    newPassword: string;
};
