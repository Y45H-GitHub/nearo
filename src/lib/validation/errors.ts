/**
 * Fixed error-code enum for every Server Action result, per
 * specs/api-design.md § 4 — call sites must pick from this list, never throw
 * ad hoc strings.
 */
export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "UNVERIFIED"
  | "NOT_OWNER"
  | "NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "DATE_CONFLICT"
  | "INVALID_TRANSITION"
  | "OTP_EXPIRED"
  | "OTP_INVALID"
  | "OTP_LOCKED"
  | "UNKNOWN";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string } };

export function actionError(
  code: ActionErrorCode,
  message: string,
): ActionResult<never> {
  return { ok: false, error: { code, message } };
}

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
