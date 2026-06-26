import { prisma } from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { UpdateUserInput } from "./user.types";

export async function getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    return user;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
    if (data.email) {
        const existing = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });
        if (existing && existing.id !== userId) {
            throw new Error("EMAIL_ALREADY_USED");
        }
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data,
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    });
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    const valid = await comparePassword(currentPassword, user.password);

    if (!valid) {
        throw new Error("INVALID_PASSWORD");
    }

    const password = await hashPassword(newPassword);

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password,
        },
    });

    return {
        message: "PASSWORD_UPDATED",
    };
}
