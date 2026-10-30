# 하정철 교수 연구·수업 자료 사이트 (MVP)

통계학과 교수의 연구·수업 자료 사이트입니다. 지금 단계는 **Firebase 없이 동작**하며,
자료는 `src/data/*.json` 파일만 고치면 바뀝니다. (프로그래밍 지식 불필요)

> ⚠️ **샘플 표시 주의**: 논문·학생 이름·연구실 위치 등에 `[샘플]`이 붙은 내용은 모두 예시(가상)입니다.
> 사이트를 공개하기 전에 반드시 실제 정보로 바꾸거나 삭제하세요.

## 1. 내 컴퓨터에서 실행하기

1. [Node.js](https://nodejs.org) LTS 버전을 설치합니다. (한 번만)
2. 이 폴더에서 터미널을 열고 차례로 입력합니다.

```bash
npm install
```

```bash
npm run dev
```

3. 터미널에 나오는 주소(보통 `http://localhost:5173`)를 브라우저에서 엽니다.
4. JSON 파일을 저장하면 화면이 자동으로 바뀝니다. 종료는 `Ctrl + C`.

배포용 파일을 만들어 보려면 `npm run build` (결과는 `dist` 폴더, 직접 열 필요 없음).

## 2. 폴더 구조 (알아 둘 것만)

| 위치 | 내용 |
|---|---|
| `src/data/profile.json` | 이름·소개·연구 주제·프로젝트·연락처 |
| `src/data/publications.json` | 논문·프리프린트·발표자료·코드 |
| `src/data/courses.json` | 학기별 과목, 주차별 자료, 공지사항 |
| `src/data/updates.json` | 홈의 "최근 소식" |
| `src/data/members.json` | 연구실 구성원, 졸업생, 모집 안내 |
| `public/` | 프로필 사진 등 정적 파일 |
| `src/services/` | 로그인·자료 읽기 로직 (Firebase 연동 때 사용) |

## 3. 교수님이 가장 먼저 수정할 5가지

1. **`profile.json`**: 소개(`bio`), 한 줄 소개(`tagline`), 연구실 위치(`office`), 면담 시간(`officeHours`)
2. **프로필 사진**: 사진 파일을 `public/` 폴더에 넣고 `profile.json`의 `photo`를 `"/내사진.jpg"`로, `photoAlt`에 사진 설명을 씁니다.
3. **`profile.json`의 외부 링크**: `links`의 `googleScholar`, `orcid`, `github` 주소 입력 (비워 두면 표시되지 않음)
4. **`publications.json`**: `[샘플]` 논문을 지우고 실제 업적 입력
5. **`courses.json`**, **`members.json`**: 실제 과목·주차 자료 링크, 구성원(학생 동의 필수)

## 4. JSON으로 내용 추가하기

각 파일 맨 위의 `_안내`와 `_example`이 **작성 예시**입니다. `_example` 안의 항목을 복사해서 목록(`[ ]`) 안에 붙여 넣고 값을 고치세요. (`_`로 시작하는 항목은 화면에 나오지 않으니 지워도 됩니다.)

### 논문 추가 (`publications.json`의 `items`)

```json
{
  "id": "2026-my-paper",
  "type": "paper",
  "title": "논문 제목",
  "authors": ["하정철", "공저자"],
  "venue": "학술지 이름 12(3), 45-67",
  "year": 2026,
  "keywords": ["시계열", "예측"],
  "doi": "10.1234/abcd",
  "pdfUrl": "https://...",
  "githubUrl": "https://github.com/..."
}
```

- `type`: `paper`(논문) / `preprint` / `slides`(발표자료) / `code`(코드·데이터)
- `id`는 항목마다 달라야 합니다. `year`는 따옴표 없는 숫자입니다.
- DOI, PDF, GitHub 링크는 없으면 그 줄을 지우면 됩니다 (버튼이 자동으로 사라짐).
- BibTeX 복사 버튼은 입력한 정보로 자동 생성합니다. 직접 쓰려면 `"bibtex"` 항목을 추가하세요.

### 수업 자료 추가 (`courses.json`)

학기 → 과목 → `weeks`(주차) → `resources`(자료) 순서입니다. 자료의 `kind`는
`slides`, `code-r`, `code-python`, `code-sas`, `data`, `assignment`, `other` 중 하나입니다.
**파일은 올리지 않고** GitHub·구글 드라이브 공유 링크 등 주소(`url`)만 적습니다.

### 공지·소식 추가

`courses.json`의 `announcements`(수업 공지), `updates.json`의 `items`(홈 소식)에 `_example`을 복사해 붙입니다. 날짜는 `"2026-11-01"` 형식이며 최신순으로 자동 정렬됩니다.

### JSON 작성 시 자주 하는 실수

- 항목 사이 **쉼표(`,`) 빠뜨림**, 또는 **마지막 항목 뒤에 쉼표**를 남김
- 글자를 감싸는 **큰따옴표(`"`)** 빠뜨림 (작은따옴표 `'`는 안 됩니다)
- 글 안의 **줄바꿈은 `\n`** 으로 씀 (엔터를 직접 누르면 오류)
- 수식의 역슬래시는 **두 번**: `\\hat{\\beta}` (JSON 규칙)

실수가 있으면 사이트 화면에 **"'○○.json' 파일의 형식에 문제가 있습니다 … 대략 N번째 줄"** 처럼 한국어 안내가 나옵니다.

## 5. 수식·코드 작성 치트시트 (마크다운)

JSON 안의 `body`, `bio`, `description` 같은 글에서 사용합니다.

| 쓰고 싶은 것 | 입력 | 
|---|---|
| **굵게** | `**굵게**` |
| 목록 | `- 항목` (줄바꿈 `\n` 뒤에) |
| 링크 | `[글자](https://주소)` |
| 문장 속 수식 | `$\\hat{\\beta}=(X^\\top X)^{-1}X^\\top y$` |
| 별도 줄 수식 | `\n\n$$\n y_t=\\phi y_{t-1}+\\varepsilon_t \n$$\n\n` (**`$$`를 각각 한 줄에**) |
| R 코드 | ` ```r ` 줄바꿈 코드 줄바꿈 ` ``` ` |

코드 색상은 `r`, `python`, `sas` 가 지원됩니다. 긴 수식은 가로 스크롤됩니다.

## 6. GitHub에 올리기

1. [github.com](https://github.com)에서 로그인 → 새 저장소(New repository) 만들기.
2. 이 프로젝트는 이미 저장소에 연결되어 있다면 변경 내용을 `git add .` → `git commit -m "내용"` → `git push` 하면 됩니다.
   처음이라면 GitHub Desktop 앱(드래그 방식)이 가장 쉽습니다.
3. `.env`, `node_modules`, `dist`는 자동으로 제외됩니다. (비밀 값은 절대 올리지 마세요.)

## 7. Netlify로 배포하기

1. [netlify.com](https://www.netlify.com)에 GitHub 계정으로 가입.
2. **Add new site → Import an existing project → GitHub** 에서 이 저장소 선택.
3. 빌드 설정은 `netlify.toml`에 들어 있어 자동입니다. (명령: `npm run build`, 폴더: `dist`) → **Deploy**.
4. 몇 분 뒤 `https://○○○.netlify.app` 주소가 생깁니다. Site settings에서 주소 이름을 바꿀 수 있습니다.
5. 이후 JSON을 고쳐 GitHub에 올리면 **자동으로 다시 배포**됩니다.
6. 새로고침해도 404가 나지 않도록 `public/_redirects`가 설정되어 있습니다.

## 8. 현재 로그인 화면에 대해

- 헤더의 **로그인** 버튼은 "Firebase 연동 후 사용 가능" 안내만 보여 줍니다.
- 화면 오른쪽 아래 **[방문자 / 교수] 스위치**는 개발 확인용입니다. 교수로 바꾸면 "관리" 메뉴(빈 페이지)가 나타납니다.
  **공개하기 전에** 이 스위치를 없애려면 `src/components/Layout.tsx`의 `<DevRoleSwitch />` 한 줄을 지우세요.
  (일반 방문자에게는 어차피 아무 권한도 없지만, 혼동을 막기 위해 권장)

다음 단계는 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)를 보세요.

## 9. 다음 단계 체크리스트

- [ ] `npm install` → `npm run dev` 로 화면 확인
- [ ] 위 "먼저 수정할 5가지" 완료, `[샘플]` 표시 모두 제거
- [ ] GitHub 저장소에 업로드
- [ ] Netlify 배포, 접속 확인
- [ ] 공개 전 `<DevRoleSwitch />` 제거 여부 결정
- [ ] `FIREBASE_SETUP.md` 순서대로 Firebase 연동

## 기술 메모 (개발자용)

Vite + React 18 + TypeScript, React Router, Tailwind CSS 3, react-markdown(+remark-math, rehype-katex, rehype-highlight).
로그인은 `AuthService` 인터페이스, 자료는 `DataService` 인터페이스로 분리되어 있어 `src/services/index.ts`에서 구현체만 교체하면 됩니다.
Firebase SDK는 설치되어 있지 않습니다.

## 질문 게시판

- 주소: `/questions` (메뉴 "질문 게시판"). 구글 로그인한 사람만 읽고 쓸 수 있고, 답변은 교수 계정만 달 수 있습니다.
- 질문은 **Firestore**에 저장됩니다. 사용하려면 `FIREBASE_SETUP.md`의 보안 규칙을 먼저 게시하세요. (규칙이 없으면 "권한이 없습니다" 안내가 나옵니다)
- Firebase 설정(`.env`)이 없으면 화면 확인용 임시 저장소로 동작하며, 새로고침하면 사라집니다.
- 무료 한도 절약: 10개씩 불러오고 "더 보기"로 추가 조회하며, 실시간 구독은 쓰지 않습니다.
