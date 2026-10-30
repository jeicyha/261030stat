import type { BookingInput, CreateSlotsResult, ConsultSlot, NewSlot, Page, PageOptions, User } from "./types";

/**
 * 상담 신청 데이터 접근 "약속(인터페이스)".
 * 앞으로의 시간만 한 번에 조금씩 조회합니다. (실시간 구독 없음)
 */
export interface ConsultService {
  /** 지금 이후의 상담 시간. 교수·본인에게는 신청 내용(booking)도 채워 줍니다. */
  listUpcoming(user: User, options?: PageOptions): Promise<Page<ConsultSlot>>;
  /** 교수: 상담 시간 등록. 이미 있거나 겹치는 시간은 만들지 않고 건너뜁니다. */
  createSlots(slots: NewSlot[]): Promise<CreateSlotsResult>;
  /** 교수: 시간 삭제(신청 내용도 함께 삭제) */
  deleteSlot(id: string): Promise<void>;
  /** 학생: 신청. 이미 예약된 시간이면 오류(code: "slot-taken") */
  book(user: User, slotId: string, input: BookingInput): Promise<void>;
  /** 학생 본인 또는 교수: 예약 취소 */
  cancel(slotId: string): Promise<void>;
}
