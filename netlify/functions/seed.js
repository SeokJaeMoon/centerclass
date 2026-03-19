import { methodNotAllowed, ok, fail, parseRequestBody } from "./lib/response.js";
import { requireAdmin } from "./lib/auth.js";
import { seedSampleData } from "./lib/stores.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const body = await parseRequestBody(request);
  const force = body.force === true || body.force === "true";
  const result = await seedSampleData(force);

  if (!result.seeded && result.reason === "existing-data") {
    return fail("이미 데이터가 존재합니다. 강제 초기화가 필요하면 force=true로 요청하세요.", 409);
  }

  return ok(result, force ? "샘플 데이터로 다시 초기화했습니다." : "샘플 데이터를 초기화했습니다.");
}
