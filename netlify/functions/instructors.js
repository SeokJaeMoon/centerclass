import { ensureSeedData, createId, deleteRecord, getRecord, listRecords, putRecord } from "./lib/stores.js";
import { getQueryParam, methodNotAllowed, ok, fail, parseRequestBody } from "./lib/response.js";
import { requireAdmin } from "./lib/auth.js";
import { validateInstructor } from "./lib/validation.js";

function sortInstructors(instructors) {
  return [...instructors].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
}

export async function handler(event) {
  await ensureSeedData();

  if (event.httpMethod === "GET") {
    const id = getQueryParam(event, "id");

    if (id) {
      const instructor = await getRecord("instructors", id);
      if (!instructor) {
        return fail("강사 정보를 찾을 수 없습니다.", 404);
      }
      return ok(instructor, "강사 상세 정보를 조회했습니다.");
    }

    const instructors = await listRecords("instructors");
    return ok(sortInstructors(instructors), "강사 목록을 조회했습니다.");
  }

  if (event.httpMethod === "POST") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    const { data, errors } = validateInstructor(body);
    if (errors.length > 0) {
      return fail("입력값을 확인해주세요.", 422, errors);
    }

    const instructor = {
      ...data,
      id: createId("inst")
    };

    await putRecord("instructors", instructor.id, instructor);
    return ok(instructor, "강사가 등록되었습니다.", 201);
  }

  if (event.httpMethod === "PUT") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    if (!body.id) {
      return fail("수정할 강사 ID가 필요합니다.", 400);
    }

    const existing = await getRecord("instructors", body.id);
    if (!existing) {
      return fail("수정할 강사를 찾을 수 없습니다.", 404);
    }

    const { data, errors } = validateInstructor(body);
    if (errors.length > 0) {
      return fail("입력값을 확인해주세요.", 422, errors);
    }

    const updatedInstructor = {
      ...existing,
      ...data,
      id: body.id
    };

    await putRecord("instructors", updatedInstructor.id, updatedInstructor);
    return ok(updatedInstructor, "강사 정보가 수정되었습니다.");
  }

  if (event.httpMethod === "DELETE") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    const id = getQueryParam(event, "id") || body.id;

    if (!id) {
      return fail("삭제할 강사 ID가 필요합니다.", 400);
    }

    const instructor = await getRecord("instructors", id);
    if (!instructor) {
      return fail("삭제할 강사를 찾을 수 없습니다.", 404);
    }

    const lectures = await listRecords("lectures");
    const isAssigned = lectures.some((lecture) => lecture.instructorId === id);

    if (isAssigned) {
      return fail("배정된 특강이 있는 강사는 삭제할 수 없습니다.", 409);
    }

    await deleteRecord("instructors", id);
    return ok({ id }, "강사가 삭제되었습니다.");
  }

  return methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
}
