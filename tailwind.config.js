/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 포인트 색상 (화사한 보라). 바꾸고 싶으면 이 값만 수정하세요.
        accent: { 50: "#f5f3ff", 100: "#ede9fe", 300: "#c4b5fd", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
        // 네이비 계열 (사이트 대표색). 바꾸고 싶으면 이 값만 수정하세요.
        navy: {
          50: "#f1f4f9",
          100: "#e1e8f2",
          200: "#c3d0e5",
          300: "#94abcd",
          400: "#6a88b6",
          500: "#4a6a9c",
          600: "#385482",
          700: "#2d4369",
          800: "#1f2f4d",
          900: "#14203a",
          950: "#0c1426",
        },
      },
      boxShadow: {
        soft: "0 4px 24px -6px rgba(76, 29, 149, 0.16)",
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', "Pretendard", '"Noto Sans KR"', "system-ui", "sans-serif"],
        mono: ['ui-monospace', '"D2Coding"', '"JetBrains Mono"', "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
