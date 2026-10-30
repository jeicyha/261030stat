import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import r from "highlight.js/lib/languages/r";
import python from "highlight.js/lib/languages/python";
import sas from "highlight.js/lib/languages/sas";
import { Link } from "react-router-dom";
import "katex/dist/katex.min.css";

const languages = { r, python, sas };

/** 마크다운(수식 $..$, 코드 ```r) 렌더러 */
export default function Markdown({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`prose-site ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypeHighlight, { languages, detect: false, plainText: ["text", "txt"] }]]}
        components={{
          a({ href = "", children }) {
            if (href.startsWith("/")) return <Link to={href}>{children}</Link>;
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
