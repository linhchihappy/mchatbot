import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      // Clear previous content and set new content to avoid double rendering artifacts
      containerRef.current.innerHTML = content;
      
      // Tell MathJax to typeset the container
      window.MathJax.typesetPromise([containerRef.current])
        .catch((err: any) => console.error('MathJax typeset failed:', err));
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={`prose prose-slate max-w-none leading-relaxed text-slate-800 ${className}`}
      // Styles for custom formatting if needed
      style={{ wordBreak: 'break-word' }}
    />
  );
};

export default MathRenderer;