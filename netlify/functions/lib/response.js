const defaultHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...defaultHeaders,
      ...headers
    }
  });
}

export function ok(data = null, message = "요청이 성공적으로 처리되었습니다.", status = 200) {
  return json(
    {
      success: true,
      message,
      data
    },
    status
  );
}

export function fail(message = "요청 처리 중 오류가 발생했습니다.", status = 400, errors = []) {
  return json(
    {
      success: false,
      message,
      errors
    },
    status
  );
}

export function methodNotAllowed(allowed = []) {
  return fail(`허용되지 않은 메서드입니다. 허용 메서드: ${allowed.join(", ")}`, 405);
}

export async function parseRequestBody(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  try {
    return await request.json();
  } catch {
    return {};
  }
}
