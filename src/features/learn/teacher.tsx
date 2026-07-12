'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GraduationCap } from 'lucide-react';
import { useMounted } from '@/features/learn/progress';

/** Teacher view — one switch reveals every instructor note. Persisted. */
interface TeacherState {
  teacher: boolean;
  toggle: () => void;
}

export const useTeacher = create<TeacherState>()(
  persist(
    (set) => ({ teacher: false, toggle: () => set((s) => ({ teacher: !s.teacher })) }),
    { name: 'uvi_teacher_view' },
  ),
);

export function TeacherToggle() {
  const mounted = useMounted();
  const teacher = useTeacher((s) => s.teacher);
  const toggle = useTeacher((s) => s.toggle);

  // CSS hook: html[data-teacher='1'] shows .instructor-notes
  useEffect(() => {
    document.documentElement.dataset.teacher = teacher ? '1' : '0';
  }, [teacher]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? teacher : false}
      aria-label="Toggle teacher view"
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 ${
        mounted && teacher
          ? 'border-gold/60 bg-gold/15 text-gold'
          : 'border-white/20 text-pearl/60 hover:border-gold/40 hover:text-gold'
      }`}
    >
      <GraduationCap size={14} />
      <span className="hidden sm:inline">Teacher view{mounted && teacher ? ': on' : ''}</span>
    </button>
  );
}
