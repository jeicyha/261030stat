import type { ConsultService } from "./consultService";
import type { ConsultSlot } from "./types";

/** Firebase 설정이 없을 때 화면 확인용 메모리 저장소 (새로고침하면 사라짐) */
export function createMockConsultService(): ConsultService {
  const at = (days: number, h: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(h, 0, 0, 0);
    return d.getTime();
  };
  let slots: ConsultSlot[] = [
    { id: "s1", start: at(1, 15), end: at(1, 15) + 1800000, mode: "대면", place: "[샘플] ○○관 ○○○호", status: "open" },
    { id: "s2", start: at(1, 15) + 1800000, end: at(1, 16), mode: "대면", place: "[샘플] ○○관 ○○○호", status: "open" },
    { id: "s3", start: at(3, 10), end: at(3, 10) + 1800000, mode: "온라인", place: "https://meet.google.com/", status: "open" },
  ];
  let bookings: Record<string, { studentName: string; studentEmail: string; topic: string }> = {};

  return {
    async listUpcoming(user, { pageSize = 30, cursor } = {}) {
      const upcoming = slots.filter((s) => s.end > Date.now()).sort((a, b) => a.start - b.start);
      const start = cursor ? Number(cursor) : 0;
      const page = upcoming.slice(start, start + pageSize).map((s) => ({
        ...s,
        booking: s.status === "booked" && (user.role === "professor" || s.bookedBy === user.id) ? bookings[s.id] : undefined,
      }));
      const end = start + pageSize;
      return { items: page, nextCursor: end < upcoming.length ? String(end) : null };
    },
    async createSlots(news) {
      slots = [...slots, ...news.map((n, i) => ({ ...n, id: `n${Date.now()}${i}`, status: "open" as const }))];
    },
    async deleteSlot(id) {
      slots = slots.filter((s) => s.id !== id);
      delete bookings[id];
    },
    async book(user, slotId, topic) {
      const s = slots.find((x) => x.id === slotId);
      if (!s || s.status !== "open") throw Object.assign(new Error("taken"), { code: "slot-taken" });
      s.status = "booked";
      s.bookedBy = user.id;
      bookings = { ...bookings, [slotId]: { studentName: user.name, studentEmail: user.email, topic } };
    },
    async cancel(slotId) {
      slots = slots.map((s) => (s.id === slotId ? { ...s, status: "open" as const, bookedBy: undefined } : s));
      const { [slotId]: _removed, ...rest } = bookings;
      void _removed;
      bookings = rest;
    },
  };
}
