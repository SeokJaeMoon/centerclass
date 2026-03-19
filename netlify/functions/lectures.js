import { ensureSeedData, createId, deleteRecord, getRecord, listRecords, putRecord } from "./lib/stores.js";
import { getQueryParam, methodNotAllowed, ok, fail, parseRequestBody } from "./lib/response.js";
import { requireAdmin } from "./lib/auth.js";
import { validateLecture } from "./lib/validation.js";

function sortLectures(lectures) {
  return [...lectures].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

async function buildLectureResponse(lecture) {
  const [applications, instructor] = await Promise.all([
    listRecords("applications"),
    getRecord("instructors", lecture.instructorId)
  ]);
  const applicationCount = applications.filter(
    (application) => application.lectureId === lecture.id && application.status !== "cancelled"
  ).length;

  return {
    ...lecture,
    applicationCount,
    remainingSeats: Math.max(lecture.maxSeats - applicationCount, 0),
    instructorName: instructor?.name || "미배정"
  };
}

export async function handler(event) {
  await ensureSeedData();

  if (event.httpMethod === "GET") {
    const id = getQueryParam(event, "id");

    if (id) {
      const lecture = await getRecord("lectures", id);
      if (!lecture) {
        return fail("특강 정보를 찾을 수 없습니다.", 404);
      }

      return ok(await buildLectureResponse(lecture), "특강 상세 정보를 조회했습니다.");
    }

    const lectures = await listRecords("lectures");
    const enriched = await Promise.all(sortLectures(lectures).map(buildLectureResponse));
    return ok(enriched, "특강 목록을 조회했습니다.");
  }

  if (event.httpMethod === "POST") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    const { data, errors } = validateLecture(body);
    if (errors.length > 0) {
      return fail("입력값을 확인해주세요.", 422, errors);
    }

    const instructor = await getRecord("instructors", data.instructorId);
    if (!instructor) {
      return fail("선택한 강사를 찾을 수 없습니다.", 404);
    }

    const lecture = {
      ...data,
      id: createId("lec")
    };

    await putRecord("lectures", lecture.id, lecture);
    return ok(lecture, "특강이 등록되었습니다.", 201);
  }

  if (event.httpMethod === "PUT") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    if (!body.id) {
      return fail("수정할 특강 ID가 필요합니다.", 400);
    }

    const existing = await getRecord("lectures", body.id);
    if (!existing) {
      return fail("수정할 특강을 찾을 수 없습니다.", 404);
    }

    const { data, errors } = validateLecture(body);
    if (errors.length > 0) {
      return fail("입력값을 확인해주세요.", 422, errors);
    }

    const instructor = await getRecord("instructors", data.instructorId);
    if (!instructor) {
      return fail("선택한 강사를 찾을 수 없습니다.", 404);
    }

    const updatedLecture = {
      ...existing,
      ...data,
      id: body.id
    };

    await putRecord("lectures", updatedLecture.id, updatedLecture);
    return ok(updatedLecture, "특강이 수정되었습니다.");
  }

  if (event.httpMethod === "DELETE") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const body = await parseRequestBody(event);
    const id = getQueryParam(event, "id") || body.id;

    if (!id) {
      return fail("삭제할 특강 ID가 필요합니다.", 400);
    }

    const lecture = await getRecord("lectures", id);
    if (!lecture) {
      return fail("삭제할 특강을 찾을 수 없습니다.", 404);
    }

    const applications = await listRecords("applications");
    const hasApplications = applications.some(
      (application) => application.lectureId === id && application.status !== "cancelled"
    );

    if (hasApplications) {
      return fail("신청 내역이 있는 특강은 삭제할 수 없습니다.", 409);
    }

    await deleteRecord("lectures", id);
    return ok({ id }, "특강이 삭제되었습니다.");
  }

  return methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
}
