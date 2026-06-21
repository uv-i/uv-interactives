import Link from 'next/link';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-200 will-change-transform hover:scale-[1.03] focus-visible:scale-[1.03] active:scale-100';

const variants: Record<Variant, string> = {
  primary: 'bg-gold text-ink shadow-glow',
  ghost: 'border border-white/15 text-pearl hover:border-gold hover:text-gold',
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: 'button' | 'submit';
};

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { children, variant = 'primary', className } = props;
  const cls = clsx(base, variants[variant], className);

  if ('href' in props && props.href) {
    if (props.external) {
      return (
        <a href={props.href} target="_blank" rel="noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }

  const { onClick, type = 'button' } = props as ButtonAsButton;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
