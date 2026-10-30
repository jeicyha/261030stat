import { useEffect, useState } from "react";
import { DataError } from "../services/jsonDataService";

interface State<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

/** 비동기 데이터를 불러오고 로딩·오류 상태를 돌려줍니다. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]): State<T> {
  const [state, setState] = useState<State<T>>({ loading: true });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    load()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((e: unknown) => {
        if (!alive) return;
        const msg =
          e instanceof DataError
            ? e.message
            : "자료를 불러오는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.";
        setState({ loading: false, error: msg });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
