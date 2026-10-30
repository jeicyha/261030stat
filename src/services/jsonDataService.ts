import type { DataService } from "./dataService";
import type {
  CoursesData,
  MembersData,
  Page,
  Profile,
  Publication,
  Update,
} from "./types";

// src/data 안의 JSON을 "글자 그대로" 가져온 뒤 직접 해석합니다.
// (이렇게 해야 쉼표 하나 빠뜨린 실수를 사이트 화면에서 쉬운 한국어로 알려 줄 수 있습니다.)
const rawFiles = import.meta.glob("../data/*.json", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** 사용자에게 그대로 보여 줘도 되는 쉬운 한국어 오류 */
export class DataError extends Error {
  constructor(message: string, public file?: string) {
    super(message);
    this.name = "DataError";
  }
}

function friendlySyntaxMessage(file: string, text: string, err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const m = raw.match(/position (\d+)/) ?? raw.match(/char (\d+)/);
  let where = "";
  if (m) {
    const pos = Number(m[1]);
    const before = text.slice(0, pos);
    const line = before.split("\n").length;
    where = ` 대략 ${line}번째 줄 근처를 확인해 주세요.`;
  }
  return (
    `'${file}' 파일의 형식에 문제가 있습니다.${where} ` +
    `자주 하는 실수: ① 항목 사이 쉼표(,) 빠짐 ② 마지막 항목 뒤에 쉼표가 남음 ` +
    `③ 글자를 감싸는 큰따옴표(") 빠짐 ④ 글 안의 줄바꿈은 \\n 으로 써야 함.`
  );
}

function loadJson(file: string): Record<string, unknown> {
  const key = `../data/${file}`;
  const text = rawFiles[key];
  if (text === undefined) {
    throw new DataError(`'${file}' 파일을 찾을 수 없습니다. src/data 폴더에 있는지 확인해 주세요.`, file);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new DataError(friendlySyntaxMessage(file, text, e), file);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new DataError(`'${file}' 파일은 { } 로 시작하는 형태여야 합니다.`, file);
  }
  return parsed as Record<string, unknown>;
}

// ── 간단한 내용 검사 ───────────────────────────────────
function requireFields(file: string, label: string, obj: unknown, fields: string[]) {
  const o = (obj ?? {}) as Record<string, unknown>;
  for (const f of fields) {
    if (o[f] === undefined || o[f] === null || o[f] === "") {
      throw new DataError(`'${file}'의 ${label}에 '${f}' 항목이 비어 있습니다.`, file);
    }
  }
}

function requireArray(file: string, obj: Record<string, unknown>, field: string): unknown[] {
  const v = obj[field];
  if (!Array.isArray(v)) {
    throw new DataError(`'${file}'에 '${field}' 목록([ ])이 없거나 형식이 잘못되었습니다.`, file);
  }
  return v;
}

const PUB_TYPES = ["paper", "preprint", "slides", "code"];

function loadProfile(): Profile {
  const f = "profile.json";
  const d = loadJson(f);
  requireFields(f, "최상위", d, ["name", "affiliation", "tagline", "email"]);
  requireArray(f, d, "keywords");
  requireArray(f, d, "researchAreas");
  requireArray(f, d, "projects");
  return d as unknown as Profile;
}

function loadPublications(): Publication[] {
  const f = "publications.json";
  const d = loadJson(f);
  const items = requireArray(f, d, "items");
  items.forEach((it, i) => {
    const label = `${i + 1}번째 항목`;
    requireFields(f, label, it, ["id", "type", "title", "year"]);
    const p = it as Publication;
    if (!PUB_TYPES.includes(p.type)) {
      throw new DataError(
        `'${f}'의 ${label}: type은 paper, preprint, slides, code 중 하나여야 합니다. (현재: ${String(p.type)})`,
        f,
      );
    }
    if (typeof p.year !== "number") {
      throw new DataError(`'${f}'의 ${label}: year는 따옴표 없는 숫자여야 합니다. (예: 2025)`, f);
    }
    if (!Array.isArray(p.authors)) {
      throw new DataError(`'${f}'의 ${label}: authors는 ["이름1", "이름2"] 형태여야 합니다.`, f);
    }
  });
  return (items as Publication[]).slice().sort((a, b) => b.year - a.year);
}

function loadUpdates(): Update[] {
  const f = "updates.json";
  const d = loadJson(f);
  const items = requireArray(f, d, "items");
  items.forEach((it, i) => requireFields(f, `${i + 1}번째 항목`, it, ["id", "date", "title"]));
  return (items as Update[]).slice().sort((a, b) => b.date.localeCompare(a.date));
}

function loadCourses(): CoursesData {
  const f = "courses.json";
  const d = loadJson(f);
  const semesters = requireArray(f, d, "semesters");
  semesters.forEach((s, i) => {
    requireFields(f, `${i + 1}번째 학기`, s, ["term"]);
    requireArray(f, s as Record<string, unknown>, "courses");
  });
  const announcements = requireArray(f, d, "announcements");
  announcements.forEach((a, i) => requireFields(f, `${i + 1}번째 공지`, a, ["id", "date", "title"]));
  return {
    semesters: semesters as CoursesData["semesters"],
    announcements: (announcements as CoursesData["announcements"])
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

function loadMembers(): MembersData {
  const f = "members.json";
  const d = loadJson(f);
  requireArray(f, d, "current");
  requireArray(f, d, "alumni");
  requireFields(f, "최상위", d, ["recruiting"]);
  return d as unknown as MembersData;
}

function paginate<T>(all: T[], pageSize = 10, cursor?: string | null): Page<T> {
  const start = cursor ? Number(cursor) || 0 : 0;
  const end = start + pageSize;
  return {
    items: all.slice(start, end),
    nextCursor: end < all.length ? String(end) : null,
    total: all.length,
  };
}

export function createJsonDataService(): DataService {
  return {
    async getProfile() {
      return loadProfile();
    },
    async getUpdates(options = {}) {
      return paginate(loadUpdates(), options.pageSize ?? 5, options.cursor);
    },
    async getPublications(query = {}) {
      let list = loadPublications();
      if (query.type && query.type !== "all") list = list.filter((p) => p.type === query.type);
      const kw = query.keyword?.trim().toLowerCase();
      if (kw) {
        list = list.filter((p) =>
          [p.title, p.venue, p.abstract ?? "", ...p.authors, ...(p.keywords ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(kw),
        );
      }
      return paginate(list, query.pageSize ?? 10, query.cursor);
    },
    async getCourses() {
      return loadCourses();
    },
    async getMembers() {
      return loadMembers();
    },
  };
}
