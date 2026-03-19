export const lectureSamples = [
  {
    id: "lec-career-ai",
    title: "AI 시대의 미래 직업 탐험",
    targetSchoolLevel: "중등",
    category: "미래기술",
    description: "인공지능이 바꾸는 직업 세계를 이해하고, 중학생이 지금부터 준비할 수 있는 역량을 함께 살펴보는 진로 특강입니다.",
    date: "2025-04-12",
    time: "14:00",
    maxSeats: 40,
    instructorId: "inst-kim",
    status: "open"
  },
  {
    id: "lec-media-branding",
    title: "브랜드를 만드는 콘텐츠 기획자",
    targetSchoolLevel: "고등",
    category: "미디어",
    description: "마케팅과 콘텐츠 기획 직무를 중심으로 실제 프로젝트 사례와 포트폴리오 준비법을 소개합니다.",
    date: "2025-04-19",
    time: "10:30",
    maxSeats: 35,
    instructorId: "inst-lee",
    status: "open"
  },
  {
    id: "lec-maker-design",
    title: "메이커로 시작하는 제품디자인 진로",
    targetSchoolLevel: "초등",
    category: "디자인",
    description: "초등학생 눈높이에서 발명, 설계, 디자인 사고를 체험하며 창의적 진로를 탐색하는 프로그램입니다.",
    date: "2025-04-26",
    time: "13:30",
    maxSeats: 30,
    instructorId: "inst-park",
    status: "open"
  },
  {
    id: "lec-health-science",
    title: "보건의료 직업군 미리보기",
    targetSchoolLevel: "전체",
    category: "보건",
    description: "의사, 간호사, 임상병리사, 물리치료사 등 보건의료 분야 직무와 학습 경로를 쉽고 정확하게 설명합니다.",
    date: "2025-05-03",
    time: "15:00",
    maxSeats: 50,
    instructorId: "inst-choi",
    status: "open"
  }
];

export const instructorSamples = [
  {
    id: "inst-kim",
    name: "김서윤",
    specialty: "AI·데이터 진로교육",
    bio: "중학생 대상 디지털 진로교육 프로그램을 다수 운영한 미래기술 교육 전문가입니다.",
    phone: "010-4123-1001",
    email: "seoyun.kim@classreg.kr"
  },
  {
    id: "inst-lee",
    name: "이도현",
    specialty: "콘텐츠 기획·브랜딩",
    bio: "청소년 대상 미디어·브랜딩 캠프를 운영하며 실무형 포트폴리오 교육을 진행하고 있습니다.",
    phone: "010-5234-1002",
    email: "dohyun.lee@classreg.kr"
  },
  {
    id: "inst-park",
    name: "박하린",
    specialty: "메이커·제품디자인",
    bio: "디자인 사고 기반 메이커 교육과 어린이 창의공작 워크숍을 전문으로 합니다.",
    phone: "010-6345-1003",
    email: "harin.park@classreg.kr"
  },
  {
    id: "inst-choi",
    name: "최민준",
    specialty: "보건의료 직업 탐색",
    bio: "청소년 대상 보건의료 진로 멘토링과 입시 연계 특강을 꾸준히 진행해 왔습니다.",
    phone: "010-7456-1004",
    email: "minjun.choi@classreg.kr"
  }
];

export const applicationSamples = [
  {
    id: "app-1001",
    studentName: "김지우",
    schoolLevel: "중등",
    schoolName: "푸른중학교",
    grade: "2",
    parentPhone: "010-2000-3001",
    lectureId: "lec-career-ai",
    appliedAt: "2025-03-10T09:30:00.000Z",
    status: "submitted"
  },
  {
    id: "app-1002",
    studentName: "박서준",
    schoolLevel: "고등",
    schoolName: "한빛고등학교",
    grade: "1",
    parentPhone: "010-2000-3002",
    lectureId: "lec-media-branding",
    appliedAt: "2025-03-10T11:00:00.000Z",
    status: "submitted"
  },
  {
    id: "app-1003",
    studentName: "이하은",
    schoolLevel: "초등",
    schoolName: "다솜초등학교",
    grade: "5",
    parentPhone: "010-2000-3003",
    lectureId: "lec-maker-design",
    appliedAt: "2025-03-11T02:15:00.000Z",
    status: "submitted"
  },
  {
    id: "app-1004",
    studentName: "정유진",
    schoolLevel: "중등",
    schoolName: "미래중학교",
    grade: "3",
    parentPhone: "010-2000-3004",
    lectureId: "lec-health-science",
    appliedAt: "2025-03-11T06:20:00.000Z",
    status: "submitted"
  }
];
