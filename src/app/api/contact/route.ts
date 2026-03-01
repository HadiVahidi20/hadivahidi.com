import { NextRequest } from "next/server";
import { z } from "zod";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log the message server-side
    console.log("Contact form submission:", {
      name: data.name,
      email: data.email,
      message: data.message.slice(0, 100) + "...",
      timestamp: new Date().toISOString(),
    });

    return successResponse({ sent: true }, 200);
  } catch (e) {
    return handleApiError(e);
  }
}
