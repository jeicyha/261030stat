# Firebase 연동 안내서 (다음 단계)

사용하는 기능은 **Firestore(자료 저장)** 와 **구글 로그인(Authentication)** 두 가지뿐이며, **Spark 무료 요금제**에서 동작하도록 설계합니다.
Cloud Functions, Cloud Storage, 유료 확장 기능은 사용하지 않습니다(파일은 외부 링크로).

## 1. Firebase 프로젝트 만들기

1. [console.firebase.google.com](https://console.firebase.google.com) → **프로젝트 추가** → 이름 입력.
2. Google 애널리틱스는 꺼도 됩니다.
3. 요금제는 기본 **Spark(무료)** 그대로 둡니다. (결제 수단 등록 불필요)

## 2. 웹 앱 등록

1. 프로젝트 개요 → **`</>` 웹** 아이콘 → 앱 닉네임 입력 → 등록 (Firebase Hosting은 체크 안 함, Netlify 사용).
2. 화면에 나오는 `firebaseConfig` 값을 복사해 둡니다 (`apiKey`, `authDomain`, `projectId`, `appId` 등).
3. 내 컴퓨터: `.env.example`을 `.env`로 복사하고 값을 채웁니다.
   (`apiKey`는 웹 앱에 공개되어도 되는 식별자이며, 실제 보호는 아래 보안 규칙이 담당합니다.)

## 3. Firestore와 구글 로그인 켜기

- **Build → Firestore Database → 데이터베이스 만들기**: 위치는 `asia-northeast3(서울)`, 모드는 **프로덕션 모드**(아래 규칙을 곧 넣습니다).
- **Build → Authentication → 시작하기 → Sign-in method → Google 사용 설정**, 지원 이메일 선택.

## 4. Netlify 환경변수 / 승인된 도메인

1. Netlify → Site configuration → **Environment variables** 에 `.env.example`의 이름(`VITE_FIREBASE_API_KEY` 등)을 그대로 등록합니다.
2. Firebase → Authentication → **설정 → 승인된 도메인** 에 Netlify 주소(`○○○.netlify.app`)와 사용 중인 커스텀 도메인을 추가합니다. (`localhost`는 기본 포함)
3. 환경변수를 바꾼 뒤에는 Netlify에서 **Trigger deploy → Clear cache and deploy** 를 누릅니다.

## 5. 코드에서 바꿀 곳 (개발 단계)

```bash
npm install firebase
```

1. `src/services/firebaseAuthService.ts` 추가: `AuthService` 인터페이스 구현 (`signInWithPopup` + `GoogleAuthProvider`, `onAuthStateChanged`).
   이메일이 `VITE_PROFESSOR_EMAIL`과 같으면 `role: "professor"`, 아니면 `"visitor"`.
2. `src/services/firestoreDataService.ts` 추가: `DataService` 구현. `getDocs` 1회 조회 + `limit(pageSize)` + `startAfter(cursor)` 페이지네이션. **실시간 `onSnapshot`은 쓰지 않습니다.**
3. `src/services/index.ts`의 두 줄만 새 구현으로 교체.
4. `DevRoleSwitch`는 `devSetRole`이 없는 서비스에서는 자동으로 숨지며, 파일 삭제 후 `Layout.tsx`의 한 줄을 지우면 됩니다.
5. 관리 페이지(`src/pages/Admin.tsx`)에 입력 폼을 추가해 JSON 대신 Firestore에 저장.

## 6. 교수 이메일 기반 관리자 권한 + Firestore 보안 규칙 초안

화면에서 "관리" 메뉴를 숨기는 것만으로는 보안이 되지 않습니다. **반드시 규칙으로 쓰기를 막아야 합니다.**
Firebase → Firestore → **규칙** 탭에 아래 초안을 붙여 넣고(이메일 확인 후) 게시하세요.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isProfessor() {
      return request.auth != null
        && request.auth.token.email == 'jeicy@kmu.kr'
        && request.auth.token.email_verified == true;
    }
    function isSignedIn() { return request.auth != null; }

    // 공개 콘텐츠: 누구나 읽기, 교수만 쓰기
    match /publications/{id} { allow read: if true; allow write: if isProfessor(); }
    match /courses/{id}      { allow read: if true; allow write: if isProfessor(); }
    match /updates/{id}      { allow read: if true; allow write: if isProfessor(); }
    match /members/{id}      { allow read: if true; allow write: if isProfessor(); }
    match /profile/{id}      { allow read: if true; allow write: if isProfessor(); }

    // 나중 기능 예시 (수업 질문 게시판): 로그인한 사람만 작성, 본인·교수만 수정/삭제
    match /questions/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.authorId == request.auth.uid
        && request.resource.data.body.size() < 5000;
      allow update, delete: if isProfessor()
        || (isSignedIn() && resource.data.authorId == request.auth.uid);
    }

    // 그 외 전부 차단
    match /{document=**} { allow read, write: if false; }
  }
}
```

> 규칙에 교수 이메일이 하드코딩되는 것은 정상입니다(클라이언트 값은 신뢰할 수 없기 때문). 이메일 변경 시 규칙도 함께 수정하세요.

## 7. Spark 무료 한도와 설계 원칙

| 항목 | 무료 한도 |
|---|---|
| 읽기 | 하루 50,000건 |
| 쓰기 / 삭제 | 각각 하루 20,000건 |
| 저장 용량 | 1 GiB |

- 목록은 **한 번에 8~20개씩** 읽고 "더 보기"로 추가 조회 (이미 이 구조로 구현됨).
- 읽기 한 번 = 문서 1개 = 1건. 페이지 열 때마다 전체를 읽지 않도록 하고, 변하지 않는 자료는 계속 JSON(정적 파일)으로 두는 것도 좋은 방법입니다.
- 실시간 구독 대신 일회성 조회, 필요하면 `localStorage` 캐시.
- 파일 업로드 금지: 자료는 GitHub·구글 드라이브·DOI 링크로.
- 한도 초과 시 Spark는 **과금 없이 해당 기능이 멈춥니다.** Firebase 콘솔 **사용량** 탭에서 가끔 확인하세요.

## 8. 추가 기능 로드맵 (Spark 한도 내 설계 방향)

| 기능 | 설계 방향 | 한도 고려 |
|---|---|---|
| 수업 질문 게시판 | `questions` 컬렉션(과목·학기 필드), 로그인 필수, 최신순 20개 + 더 보기, 교수 답변은 필드로 저장 | 학생 수×질문 수 정도의 쓰기. 무료 범위로 충분 |
| 대학원생 토론 | `threads` + 하위 `comments`, 허용 이메일 목록(`allowedMembers`)을 규칙으로 검사, 새로고침 버튼으로 갱신(실시간 아님) | 읽기가 많아지기 쉬우므로 페이지 크기 제한·캐시 |
| 공지 알림 | Cloud Functions 대신 **방문 시 확인**(마지막 확인 시각을 localStorage에 저장) | 서버 기능 불필요 |
| 방문자 통계 | Firestore 카운터 대신 Netlify Analytics 또는 외부 무료 도구 | 쓰기 한도 절약 |
| 관리 페이지에서 자료 편집 | 폼 → Firestore `set`. 변경 빈도가 낮아 쓰기 부담 작음 | 쓰기 2만/일이면 충분 |

각 기능은 `types.ts`에 타입 추가 → `services/`에 인터페이스 추가 → 구현체 작성 순서로 확장하세요.
