import { getAdminConfig, verifyAdminCredentials } from "./lib/auth.js";
import { methodNotAllowed, ok, fail, parseRequestBody } from "./lib/response.js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const body = await parseRequestBody(request);
  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();

  if (!username || !password) {
    return fail("아이디와 비밀번호를 입력해주세요.", 422);
  }

  if (!verifyAdminCredentials(username, password)) {
    return fail("관리자 계정 정보가 올바르지 않습니다.", 401);
  }

  const config = getAdminConfig();
  return ok(
    {
      token: config.token,
      user: {
        username: config.username,
        name: "데모 관리자"
      }
    },
    "관리자 로그인에 성공했습니다."
  );
}
