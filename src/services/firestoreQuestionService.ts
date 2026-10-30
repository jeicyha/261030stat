import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseApp } from "./firebaseApp";
import type { QuestionService } from "./questionService";
import type { Question } from "./types";

const COLLECTION = "questions";

export function createFirestoreQuestionService(): QuestionService {
  const db = getFirestore(getFirebaseApp());
  const col = collection(db, COLLECTION);

  return {
    async list({ pageSize = 10, cursor } = {}) {
      // 한 번에 pageSize개만 읽습니다 (읽기 1건 = 문서 1개). 다음 페이지 확인용으로 1개 더 읽음.
      const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
      if (cursor) constraints.push(startAfter(Timestamp.fromMillis(Number(cursor))));
      constraints.push(limit(pageSize + 1));
      const snap = await getDocs(query(col, ...constraints));

      const all: Question[] = snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id,
          authorId: x.authorId,
          authorName: x.authorName,
          course: x.course || undefined,
          title: x.title,
          body: x.body,
          createdAt: (x.createdAt as Timestamp | null)?.toMillis() ?? Date.now(),
          answer: x.answer || undefined,
          answeredAt: (x.answeredAt as Timestamp | undefined)?.toMillis(),
        };
      });
      const items = all.slice(0, pageSize);
      const more = all.length > pageSize;
      return { items, nextCursor: more ? String(items[items.length - 1].createdAt) : null };
    },
    async create(user, input) {
      const data: Record<string, unknown> = {
        authorId: user.id,
        authorName: user.name,
        title: input.title,
        body: input.body,
        createdAt: serverTimestamp(),
      };
      if (input.course) data.course = input.course;
      await addDoc(col, data);
    },
    async answer(id, answer) {
      await updateDoc(doc(db, COLLECTION, id), { answer, answeredAt: serverTimestamp() });
    },
    async remove(id) {
      await deleteDoc(doc(db, COLLECTION, id));
    },
  };
}
