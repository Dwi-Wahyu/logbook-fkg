// lib/api-utils.ts
import { NextResponse } from "next/server";
import { z, ZodType } from "zod";

export async function validateRequest<T extends ZodType>(
  request: Request,
  schema: T
): Promise<{ data?: z.infer<T>; error?: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: "Validation failed",
            details: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    return {
      error: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}
