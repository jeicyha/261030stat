import {
  Timestamp,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
  writeBatch,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseApp } from "./firebaseApp";
import type { ConsultService } from "./consultService";
import type { ConsultSlot } from "./types";

// 상담 시간: consultSlots/{id}  (누구나 로그인하면 읽기 - 예약자 이름은 없음)
// 신청 내용: consultBookings/{슬롯id}  (본인·교수만 읽기)
const SLOTS = "consultSlots";
const BOOKINGS = "consultBookings";

export function createFirestoreConsultService(): ConsultService {
  const db = getFirestore(getFirebaseApp());
  const slotsCol = collection(db, SLOTS);

  return {
    async listUpcoming(user, { pageSize = 30, cursor } = {}) {
      // 지금 이후 시간만, 시작 시각 순으로 pageSize개 (+1개는 다음 페이지 확인용)
      const constraints: QueryConstraint[] = [
        where("start", ">=", Timestamp.now()),
        orderBy("start", "asc"),
      ];
      if (cursor) constraints.push(startAfter(Timestamp.fromMillis(Number(cursor))));
      constraints.push(limit(pageSize + 1));
      const snap = await getDocs(query(slotsCol, ...constraints));

      const all: ConsultSlot[] = snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          start: (x.start as Timestamp).toMillis(),
          end: (x.end as Timestamp).toMillis(),
          mode: x.mode,
          place: x.place || undefined,
          status: x.status,
          bookedBy: x.bookedBy || undefined,
        };
      });
      const items = all.slice(0, pageSize);

      // 교수·본인이 신청한 칸만 신청 내용을 추가로 읽음 (읽기 한도 절약)
      await Promise.all(
        items
          .filter((s) => s.status === "booked" && (user.role === "professor" || s.bookedBy === user.id))
          .map(async (s) => {
            const b = await getDoc(doc(db, BOOKINGS, s.id));
            if (b.exists()) {
              const x = b.data();
              s.booking = { studentName: x.studentName, grade: x.grade, studentEmail: x.studentEmail, topic: x.topic };
            }
          }),
      );
      const more = all.length > pageSize;
      return { items, nextCursor: more ? String(items[items.length - 1].start) : null };
    },

    async createSlots(news) {
      const batch = writeBatch(db);
      for (const n of news) {
        const data: Record<string, unknown> = {
          start: Timestamp.fromMillis(n.start),
          end: Timestamp.fromMillis(n.end),
          mode: n.mode,
          status: "open",
        };
        if (n.place) data.place = n.place;
        batch.set(doc(slotsCol), data);
      }
      await batch.commit();
    },

    async deleteSlot(id) {
      const batch = writeBatch(db);
      batch.delete(doc(db, SLOTS, id));
      batch.delete(doc(db, BOOKINGS, id));
      await batch.commit();
    },

    async book(user, slotId, input) {
      const batch = writeBatch(db);
      batch.update(doc(db, SLOTS, slotId), { status: "booked", bookedBy: user.id });
      batch.set(doc(db, BOOKINGS, slotId), {
        studentId: user.id,
        studentName: input.name,
        grade: input.grade,
        studentEmail: user.email,
        topic: input.topic,
        createdAt: serverTimestamp(),
      });
      try {
        await batch.commit();
      } catch (e) {
        // 같은 시간을 다른 사람이 먼저 신청한 경우 규칙이 거부함
        if ((e as { code?: string }).code === "permission-denied")
          throw Object.assign(e as Error, { code: "slot-taken" });
        throw e;
      }
    },

    async cancel(slotId) {
      const batch = writeBatch(db);
      batch.update(doc(db, SLOTS, slotId), { status: "open", bookedBy: deleteField() });
      batch.delete(doc(db, BOOKINGS, slotId));
      await batch.commit();
    },
  };
}
