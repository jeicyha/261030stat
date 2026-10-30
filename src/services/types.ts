// 사이트에서 쓰는 모든 데이터 타입입니다.
// JSON 파일(src/data)과 나중에 Firestore 문서가 같은 모양을 갖도록 맞춰 두었습니다.

export type Role = "professor" | "visitor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ExternalLinks {
  googleScholar?: string;
  orcid?: string;
  github?: string;
}

export interface Profile {
  name: string;
  nameEn?: string;
  title: string; // 예: 교수
  affiliation: string;
  tagline: string;
  photo: string; // 이미지 주소 (public 폴더 경로 또는 외부 URL)
  photoAlt: string;
  keywords: string[];
  email: string;
  office: string;
  officeHours: string;
  mapUrl?: string;
  bio: string; // 마크다운
  links: ExternalLinks;
  researchAreas: ResearchTopic[];
  projects: Project[];
}

export interface ResearchTopic {
  title: string;
  body: string; // 마크다운 (수식·코드 가능)
}

export interface Project {
  title: string;
  period: string;
  funder?: string;
  status: "진행 중" | "완료";
  summary: string;
}

export type PublicationType = "paper" | "preprint" | "slides" | "code";

export interface Publication {
  id: string;
  type: PublicationType;
  title: string;
  authors: string[];
  venue: string; // 학술지·학회명
  year: number;
  keywords: string[];
  abstract?: string;
  doi?: string; // 예: 10.1000/xyz (주소 전체가 아님)
  pdfUrl?: string;
  githubUrl?: string;
  bibtex?: string; // 비워 두면 자동으로 만들어 줍니다
}

export interface Update {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  body?: string; // 마크다운
  url?: string;
}

export type ResourceKind =
  | "slides"
  | "code-r"
  | "code-python"
  | "code-sas"
  | "data"
  | "assignment"
  | "other";

export interface Resource {
  kind: ResourceKind;
  label: string;
  url: string;
}

export interface Week {
  week: number;
  topic: string;
  resources: Resource[];
}

export interface Course {
  code: string;
  name: string;
  description: string;
  syllabusUrl?: string;
  weeks: Week[];
}

export interface Semester {
  term: string; // 예: 2026-2학기
  courses: Course[];
}

export interface Announcement {
  id: string;
  date: string;
  course?: string;
  title: string;
  body: string; // 마크다운
}

export interface CoursesData {
  semesters: Semester[];
  announcements: Announcement[];
}

export interface Member {
  name: string;
  role: string; // 박사과정, 석사과정 등
  interest?: string;
  email?: string;
  year?: string; // 입학 연도
}

export interface Alumnus {
  name: string;
  degree: string;
  graduated: string; // 졸업 연도
  now?: string; // 현재 소속
}

export interface MembersData {
  current: Member[];
  alumni: Alumnus[];
  recruiting: { open: boolean; body: string }; // body는 마크다운
}

// ── 목록 조회(페이지네이션) ─────────────────────────────
// Firestore 무료 한도(읽기 하루 5만)를 아끼려면 한 번에 조금씩만 읽어야 합니다.
// cursor는 "다음 페이지 시작 위치"를 뜻하는 문자열입니다.
export interface PageOptions {
  pageSize?: number;
  cursor?: string | null;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null; // null이면 마지막 페이지
  total?: number;
}

export interface PublicationQuery extends PageOptions {
  type?: PublicationType | "all";
  keyword?: string;
}
