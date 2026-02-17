/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    details?: any
  }
}

/**
 * Standard API error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Server errors (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any
): Response {
  const body: ApiErrorResponse = {
    error: {
      message,
      code,
      details,
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message = "Bad request", details?: any) =>
    createErrorResponse(message, 400, ErrorCodes.BAD_REQUEST, details),

  unauthorized: (message = "Unauthorized") =>
    createErrorResponse(message, 401, ErrorCodes.UNAUTHORIZED),

  forbidden: (message = "Forbidden") =>
    createErrorResponse(message, 403, ErrorCodes.FORBIDDEN),

  notFound: (message = "Resource not found") =>
    createErrorResponse(message, 404, ErrorCodes.NOT_FOUND),

  conflict: (message = "Conflict", details?: any) =>
    createErrorResponse(message, 409, ErrorCodes.CONFLICT, details),

  validationError: (message = "Validation error", details?: any) =>
    createErrorResponse(message, 422, ErrorCodes.VALIDATION_ERROR, details),

  internalError: (message = "Internal server error", details?: any) =>
    createErrorResponse(message, 500, ErrorCodes.INTERNAL_ERROR, details),

  databaseError: (message = "Database error") =>
    createErrorResponse(message, 500, ErrorCodes.DATABASE_ERROR),

  externalServiceError: (message = "External service error") =>
    createErrorResponse(message, 502, ErrorCodes.EXTERNAL_SERVICE_ERROR),
}

/**
 * Wrap async API handler with error handling
 */
export function withErrorHandling(
  handler: (req: Request, context?: any) => Promise<Response>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error("API Error:", error)

      // Handle known error types
      if (error instanceof Error) {
        return ApiErrors.internalError(
          process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred"
        )
      }

      return ApiErrors.internalError()
    }
  }
}
