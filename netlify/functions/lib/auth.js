import { fail } from "./response.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "classreg-demo-admin-token";

export function getAdminConfig() {
  return {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    token: ADMIN_TOKEN
  };
}

export function verifyAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function extractAdminToken(request) {
  const authHeader = request.headers.get("authorization");
  const customToken = request.headers.get("x-admin-token");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }

  return customToken?.trim() || "";
}

export function isAdminAuthorized(request) {
  return extractAdminToken(request) === ADMIN_TOKEN;
}

export function requireAdmin(request) {
  if (!isAdminAuthorized(request)) {
    return fail("관리자 인증이 필요합니다.", 401);
  }

  return null;
}
