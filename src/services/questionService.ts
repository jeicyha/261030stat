import type { NewQuestion, Page, PageOptions, Question, User } from "./types";

/**
 * 질문 게시판 데이터 접근 "약속(인터페이스)".
 * Spark 무료 한도를 위해 실시간 구독 없이 한 번만 조회하고, 목록은 cursor로 나눠 읽습니다.
 */
export interface QuestionService {
  list(options?: PageOptions): Promise<Page<Question>>;
  create(user: User, input: NewQuestion): Promise<void>;
  /** 교수 답변 등록·수정 */
  answer(id: string, answer: string): Promise<void>;
  remove(id: string): Promise<void>;
}
