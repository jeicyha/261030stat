import type {
  CoursesData,
  MembersData,
  Page,
  PageOptions,
  Profile,
  Publication,
  PublicationQuery,
  Update,
} from "./types";

/**
 * 자료(데이터)를 읽어 오는 "약속(인터페이스)"입니다.
 * 지금은 jsonDataService.ts(src/data/*.json)가 구현하고,
 * 나중에 firestoreDataService.ts를 만들어 index.ts에서 바꿔 끼우면 됩니다.
 *
 * 설계 원칙 (Firebase Spark 무료 요금제):
 *  - 실시간 구독(onSnapshot) 대신 한 번만 읽기(get)
 *  - 목록은 pageSize + cursor 방식으로 조금씩 읽기
 */
export interface DataService {
  getProfile(): Promise<Profile>;
  getUpdates(options?: PageOptions): Promise<Page<Update>>;
  getPublications(query?: PublicationQuery): Promise<Page<Publication>>;
  getCourses(): Promise<CoursesData>;
  getMembers(): Promise<MembersData>;
}
