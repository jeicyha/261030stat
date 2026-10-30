// 서비스를 한곳에서 고르는 파일입니다.
// .env에 Firebase 설정이 있으면 실제 구글 로그인, 없으면 가짜(mock) 로그인을 씁니다.
import { createMockAuthService } from "./mockAuthService";
import { createFirebaseAuthService, hasFirebaseConfig } from "./firebaseAuthService";
import { createJsonDataService } from "./jsonDataService";

export const authService = hasFirebaseConfig ? createFirebaseAuthService() : createMockAuthService();
// 자료는 아직 JSON입니다. Firestore 연동 시 firestoreDataService로 교체합니다.
export const dataService = createJsonDataService();
