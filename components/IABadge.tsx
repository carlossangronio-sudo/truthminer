'use client';

interface IABadgeProps {
  text: string;
  className?: string;
}

/**
 * Badge IA avec style glassmorphism
 */
export const IABadge = ({ text, className = '' }: IABadgeProps) => (
  <div
    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white shadow-sm text-[10px] font-black text-blue-600 mb-8 tracking-widest uppercase ${className}`}
  >
    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
    {text}
  </div>
);

