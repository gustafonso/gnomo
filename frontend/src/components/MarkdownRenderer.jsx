import React, { Component, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Componente para segurança de renderização
class SafeMarkdown extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Markdown render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">⚠️ Erro ao renderizar este conteúdo.</div>;
    }
    return this.props.children;
  }
}

// Renderizador de blocos de código
function CodeBlock({ inline, className, children }) {
  const code = String(children).replace(/\n$/, '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (inline) {
    return (
      <code className="bg-neutral-800 px-1 rounded text-sm">
        {code}
      </code>
    );
  }

  const language = (className || '').replace('language-', '');
  const highlighted = hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value;

  return (
    <div className="relative group my-4">
      <pre className="bg-neutral-950 rounded-xl p-4 overflow-auto">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} className="hljs text-sm" />
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-neutral-800 text-xs text-white px-2 py-1 rounded"
      >
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

// Markdown principal
export default function MarkdownRenderer({ content = '' }) {
  return (
    <SafeMarkdown>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          hr: () => <hr className="my-6 border-neutral-700" />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 border-b border-neutral-700 pb-1" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3 border-b border-neutral-700 pb-1" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-5 mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-6 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-neutral-700 pl-4 italic text-neutral-400 my-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-auto">
              <table className="table-auto border border-neutral-700 w-full text-sm text-left" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-neutral-700 bg-neutral-800 px-2 py-1" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-neutral-700 px-2 py-1" {...props} />
          ),
        }}
        className="prose prose-invert max-w-none break-words"
      >
        {content}
      </ReactMarkdown>
    </SafeMarkdown>
  );
}