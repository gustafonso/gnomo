import MarkdownRenderer from './MarkdownRenderer';

export default function Message({ role, content }) {
  const isUser = role === 'user';

  if (isUser) {
    // Mensagem do usuário com balão arredondado à direita
    return (
      <div className="flex justify-end">
        <div className="relative p-2 rounded-xl border border-neutral-900 bg-neutral-800 max-w-[70%]">
          <div className="text-xs text-neutral-400 mb-1">Você</div>
          <MarkdownRenderer content={content} />
        </div>
      </div>
    );
  }

  // Mensagem do GNOMO sem balão, ocupando toda a largura
  return (
    <div className="flex justify-start">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="text-xs text-neutral-500 mb-2">GNOMO</div>
        <div className="space-y-4">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
}