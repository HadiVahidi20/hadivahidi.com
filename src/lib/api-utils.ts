import { NextResponse } from "next/server";
import { z } from "zod";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    perPage: number;
    total: number;
  },
) {
  const totalPages = Math.ceil(pagination.total / pagination.perPage);
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      current_page: pagination.page,
      per_page: pagination.perPage,
      total_items: pagination.total,
      total_pages: totalPages,
      has_next: pagination.page < totalPages,
      has_prev: pagination.page > 1,
    },
  });
}

export function handleApiError(error: unknown) {
  if (error instanceof z.ZodError) {
    const messages = error.issues.map(
      (issue: z.ZodIssue) => issue.message,
    );
    return errorResponse(`Validation error: ${messages.join(", ")}`, 400);
  }

  console.error("API Error:", error);
  return errorResponse("Internal server error", 500);
}
