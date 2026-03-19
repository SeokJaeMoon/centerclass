import { ensureSeedData, createId, getRecord, listRecords, putRecord } from "./lib/stores.js";
import { getQueryParam, methodNotAllowed, ok, fail, parseRequestBody } from "./lib/response.js";
import { requireAdmin } from "./lib/auth.js";
import { validateApplication } from "./lib/validation.js";

function sortApplications(applications) {
  return [...applications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
}

export async function handler(event) {
  await ensureSeedData();

  if (event.httpMethod === "GET") {
    const unauthorized = requireAdmin(event);
    if (unauthorized) return unauthorized;

    const lectureId = getQueryParam(event, "lectureId");
    const schoolLevel = getQueryParam(event, "schoolLevel");
    const applications = await listRecords("applications");

    const filtered = applications.filter((application) => {
      const lectureMatched = lectureId ? application.lectureId === lectureId : true;
      const schoolLevelMatched = schoolLevel ? application.schoolLevel === schoolLevel : true;
      return lectureMatched && schoolLevelMatched;
    });

    return ok(sortApplications(filtered), "신청 목록을 조회했습니다.");
  }

  if (event.httpMethod === "POST") {
    const body = await parseRequestBody(event);
    const { data, errors } = validateApplication(body);
    if (errors.length > 0) {
      return fail("입력값을 확인해주세요.", 422, errors);
    }

    const lecture = await getRecord("lectures", data.lectureId);
    if (!lecture) {
      return fail("신청할 특강을 찾을 수 없습니다.", 404);
    }

    if (lecture.status !== "open") {
      return fail("현재 신청 가능한 상태의 특강이 아닙니다.", 409);
    }

    const applications = await listRecords("applications");
    const activeApplications = applications.filter(
      (application) => application.lectureId === data.lectureId && application.status !== "cancelled"
    );
    const duplicate = activeApplications.find(
      (application) =>
        application.studentName === data.studentName &&
        application.parentPhone === data.parentPhone &&
        application.lectureId === data.lectureId
    );

    if (duplicate) {
      return fail("같은 학생의 중복 신청은 허용되지 않습니다.", 409);
    }

    if (activeApplications.length >= lecture.maxSeats) {
      return fail("정원이 마감되었습니다.", 409);
    }

    const application = {
      ...data,
      id: createId("app"),
      appliedAt: new Date().toISOString(),
      status: "submitted"
    };

    await putRecord("applications", application.id, application);
    return ok(application, "수강 신청이 완료되었습니다.", 201);
  }

  return methodNotAllowed(["GET", "POST"]);
}
