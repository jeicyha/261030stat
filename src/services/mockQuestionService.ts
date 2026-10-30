import type { QuestionService } from "./questionService";
import type { Question } from "./types";

/** Firebase 설정이 없을 때 화면 확인용으로 쓰는 메모리 저장소 (새로고침하면 사라짐) */
export function createMockQuestionService(): QuestionService {
  let items: Question[] = [
    {
      id: "q1", authorId: "sample", authorName: "[샘플] 학생", course: "시계열자료분석",
      title: "[샘플] ACF가 천천히 감소하면 차분해야 하나요?",
      body: "ACF가 **천천히 감소**하는데 $d=1$ 차분을 해야 할까요?", createdAt: Date.now() - 86400000,
    },
  ];
  return {
    async list({ pageSize = 10, cursor } = {}) {
      const start = cursor ? Number(cursor) : 0;
      const end = start + pageSize;
      return { items: items.slice(start, end), nextCursor: end < items.length ? String(end) : null };
    },
    async create(user, input) {
      items = [{ id: "q" + Date.now(), authorId: user.id, authorName: user.name, createdAt: Date.now(), ...input }, ...items];
    },
    async answer(id, answer) {
      items = items.map((q) => (q.id === id ? { ...q, answer, answeredAt: Date.now() } : q));
    },
    async remove(id) {
      items = items.filter((q) => q.id !== id);
    },
  };
}
