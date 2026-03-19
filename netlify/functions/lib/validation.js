const schoolLevels = ["초등", "중등", "고등", "전체"];
const lectureStatuses = ["open", "closed", "completed"];
const applicationStatuses = ["submitted", "cancelled"];

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function sanitizeLectureInput(payload) {
  return {
    id: payload.id,
    title: String(payload.title || "").trim(),
    targetSchoolLevel: String(payload.targetSchoolLevel || "").trim(),
    category: String(payload.category || "").trim(),
    description: String(payload.description || "").trim(),
    date: String(payload.date || "").trim(),
    time: String(payload.time || "").trim(),
    maxSeats: normalizeNumber(payload.maxSeats),
    instructorId: String(payload.instructorId || "").trim(),
    status: String(payload.status || "").trim()
  };
}

export function validateLecture(payload) {
  const data = sanitizeLectureInput(payload);
  const errors = [];

  if (!hasValue(data.title)) errors.push("특강명을 입력해주세요.");
  if (!schoolLevels.includes(data.targetSchoolLevel)) errors.push("대상 학교급을 올바르게 선택해주세요.");
  if (!hasValue(data.category)) errors.push("카테고리를 입력해주세요.");
  if (!hasValue(data.description)) errors.push("특강 설명을 입력해주세요.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) errors.push("날짜 형식은 YYYY-MM-DD 이어야 합니다.");
  if (!/^\d{2}:\d{2}$/.test(data.time)) errors.push("시간 형식은 HH:MM 이어야 합니다.");
  if (!Number.isInteger(data.maxSeats) || data.maxSeats <= 0) errors.push("정원은 1명 이상의 숫자여야 합니다.");
  if (!hasValue(data.instructorId)) errors.push("강사를 선택해주세요.");
  if (!lectureStatuses.includes(data.status)) errors.push("상태 값을 올바르게 선택해주세요.");

  return {
    data,
    errors
  };
}

export function sanitizeInstructorInput(payload) {
  return {
    id: payload.id,
    name: String(payload.name || "").trim(),
    specialty: String(payload.specialty || "").trim(),
    bio: String(payload.bio || "").trim(),
    phone: String(payload.phone || "").trim(),
    email: String(payload.email || "").trim()
  };
}

export function validateInstructor(payload) {
  const data = sanitizeInstructorInput(payload);
  const errors = [];

  if (!hasValue(data.name)) errors.push("강사명을 입력해주세요.");
  if (!hasValue(data.specialty)) errors.push("전문 분야를 입력해주세요.");
  if (!hasValue(data.bio)) errors.push("강사 소개를 입력해주세요.");
  if (!/^[0-9-]{10,13}$/.test(data.phone)) errors.push("연락처는 숫자와 하이픈 형식으로 입력해주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("이메일 형식을 확인해주세요.");

  return {
    data,
    errors
  };
}

export function sanitizeApplicationInput(payload) {
  return {
    id: payload.id,
    studentName: String(payload.studentName || "").trim(),
    schoolLevel: String(payload.schoolLevel || "").trim(),
    schoolName: String(payload.schoolName || "").trim(),
    grade: String(payload.grade || "").trim(),
    parentPhone: String(payload.parentPhone || "").trim(),
    lectureId: String(payload.lectureId || "").trim(),
    appliedAt: payload.appliedAt,
    status: String(payload.status || "submitted").trim()
  };
}

export function validateApplication(payload) {
  const data = sanitizeApplicationInput(payload);
  const errors = [];

  if (!hasValue(data.studentName)) errors.push("학생 이름을 입력해주세요.");
  if (!schoolLevels.includes(data.schoolLevel) || data.schoolLevel === "전체") errors.push("학교급을 올바르게 선택해주세요.");
  if (!hasValue(data.schoolName)) errors.push("학교명을 입력해주세요.");
  if (!/^\d{1,2}$/.test(data.grade)) errors.push("학년은 숫자로 입력해주세요.");
  if (!/^[0-9-]{10,13}$/.test(data.parentPhone)) errors.push("보호자 연락처 형식을 확인해주세요.");
  if (!hasValue(data.lectureId)) errors.push("신청할 특강을 선택해주세요.");
  if (!applicationStatuses.includes(data.status)) errors.push("신청 상태 값이 올바르지 않습니다.");

  return {
    data,
    errors
  };
}
