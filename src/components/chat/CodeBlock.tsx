'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mapeo de lenguajes comunes
  const languageMap: Record<string, string> = {
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'python': 'python',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'bash': 'bash',
    'sh': 'bash',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'markdown': 'markdown',
    'md': 'markdown',
  };

  const normalizedLanguage = languageMap[language.toLowerCase()] || 'text';

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-white/10 bg-[#1a1a2e]/80 ${isExpanded ? 'max-h-none' : 'max-h-80'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-white/50 ml-2 font-mono">{normalizedLanguage}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Contraer' : 'Expandir'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-white/50" />
            ) : (
              <Maximize2 className="w-4 h-4 text-white/50" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg 
                       hover:bg-white/10 transition-colors"
            title="Copiar código"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white/50" />
                <span className="text-xs text-white/50">Copiar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="overflow-auto">
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers={code.split('\n').length > 5}
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
