const defaultHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export function json(payload, status = 200, headers = {}) {
  return {
    statusCode: status,
    headers: {
      ...defaultHeaders,
      ...headers
    },
    body: JSON.stringify(payload)
  };
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

export function getHeader(event, headerName) {
  const headers = event?.headers || {};
  const direct = headers[headerName];

  if (direct) return direct;

  const loweredKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
  return loweredKey ? headers[loweredKey] : "";
}

export function getQueryParam(event, key) {
  if (event?.queryStringParameters?.[key] !== undefined) {
    return event.queryStringParameters[key];
  }

  if (event?.rawUrl) {
    const url = new URL(event.rawUrl);
    return url.searchParams.get(key);
  }

  return null;
}

export async function parseRequestBody(event) {
  const contentType = getHeader(event, "content-type") || "";
  const rawBody = event?.body
    ? event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf-8")
      : event.body
    : "";

  if (!rawBody) {
    return {};
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody).entries());
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}
