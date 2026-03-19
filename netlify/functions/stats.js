import { ensureSeedData, listRecords } from "./lib/stores.js";
import { methodNotAllowed, ok } from "./lib/response.js";
import { requireAdmin } from "./lib/auth.js";

export default async function handler(request) {
  await ensureSeedData();

  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const [lectures, instructors, applications] = await Promise.all([
    listRecords("lectures"),
    listRecords("instructors"),
    listRecords("applications")
  ]);

  const activeApplications = applications.filter((application) => application.status !== "cancelled");

  const applicationsByLecture = lectures
    .map((lecture) => ({
      lectureId: lecture.id,
      title: lecture.title,
      targetSchoolLevel: lecture.targetSchoolLevel,
      maxSeats: lecture.maxSeats,
      count: activeApplications.filter((application) => application.lectureId === lecture.id).length
    }))
    .sort((a, b) => b.count - a.count);

  const schoolLevelOrder = ["초등", "중등", "고등"];
  const schoolLevelDistribution = schoolLevelOrder.map((level) => ({
    label: level,
    count: activeApplications.filter((application) => application.schoolLevel === level).length
  }));

  const instructorAssignments = instructors
    .map((instructor) => {
      const assignedLectures = lectures.filter((lecture) => lecture.instructorId === instructor.id);
      return {
        instructorId: instructor.id,
        name: instructor.name,
        specialty: instructor.specialty,
        count: assignedLectures.length,
        lectures: assignedLectures.map((lecture) => lecture.title)
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko-KR"));

  const summary = {
    totalLectures: lectures.length,
    totalApplications: activeApplications.length,
    totalInstructors: instructors.length,
    openLectures: lectures.filter((lecture) => lecture.status === "open").length
  };

  return ok(
    {
      summary,
      applicationsByLecture,
      schoolLevelDistribution,
      instructorAssignments
    },
    "통계 데이터를 조회했습니다."
  );
}
