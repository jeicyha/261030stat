import { useEffect } from "react";

const SITE = "하정철 | 계명대학교 통계학과";

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

/** 페이지마다 제목·설명·Open Graph 태그를 바꿔 줍니다. */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const full = title ? `${title} · ${SITE}` : SITE;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", window.location.href);
  }, [title, description]);
}
