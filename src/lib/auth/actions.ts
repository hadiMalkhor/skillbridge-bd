"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { Role } from "@/generated/prisma/enums";

export interface RegisterActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password" | "role", string>>;
}

export async function registerUser(
  rawInput: unknown
): Promise<RegisterActionResult> {
  const validated = registerSchema.safeParse(rawInput);

  if (!validated.success) {
    const formattedErrors = validated.error.flatten().fieldErrors;
    return {
      success: false,
      error: "Please correct the errors in the form.",
      fieldErrors: {
        name: formattedErrors.name?.[0],
        email: formattedErrors.email?.[0],
        password: formattedErrors.password?.[0],
        role: formattedErrors.role?.[0],
      },
    };
  }

  const { name, email, password, role } = validated.data;
  const normalizedEmail = email.toLowerCase();

  // Safety check: ensure ADMIN is strictly forbidden
  if (role !== "CANDIDATE" && role !== "EMPLOYER") {
    return {
      success: false,
      error: "Invalid role selection.",
    };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email address already exists. Please log in instead.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: role as Role,
        },
        select: {
          id: true,
        },
      });

      if (role === "CANDIDATE") {
        await tx.candidateProfile.create({
          data: {
            userId: newUser.id,
            headline: "",
            bio: "",
            location: "",
            links: [],
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user during registration:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating your account. Please try again.",
    };
  }
}
