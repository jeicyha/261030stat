// 서비스를 한곳에서 고르는 파일입니다.
// Firebase 연동 때 아래 두 줄만 firebase 버전으로 바꾸면 됩니다.
//   import { createFirebaseAuthService } from "./firebaseAuthService";
//   export const authService = createFirebaseAuthService();
import { createMockAuthService } from "./mockAuthService";
import { createJsonDataService } from "./jsonDataService";

export const authService = createMockAuthService();
export const dataService = createJsonDataService();
