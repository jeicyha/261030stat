// 서비스를 한곳에서 고르는 파일입니다.
// .env에 Firebase 설정이 있으면 실제 구글 로그인·Firestore, 없으면 가짜(mock)를 씁니다.
import { createMockAuthService } from "./mockAuthService";
import { createFirebaseAuthService, hasFirebaseConfig } from "./firebaseAuthService";
import { createJsonDataService } from "./jsonDataService";
import { createMockQuestionService } from "./mockQuestionService";
import { createFirestoreQuestionService } from "./firestoreQuestionService";
import { createMockConsultService } from "./mockConsultService";
import { createFirestoreConsultService } from "./firestoreConsultService";

export const authService = hasFirebaseConfig ? createFirebaseAuthService() : createMockAuthService();
// 사이트 자료(논문·수업 등)는 아직 JSON입니다. Firestore 연동 시 교체합니다.
export const dataService = createJsonDataService();
export const questionService = hasFirebaseConfig ? createFirestoreQuestionService() : createMockQuestionService();
export const consultService = hasFirebaseConfig ? createFirestoreConsultService() : createMockConsultService();
