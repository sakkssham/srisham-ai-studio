import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Flex({
  children,
  className,
  ...props
}: LayoutProps) {
  return (
    <div
      className={twMerge('flex flex-row items-center gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface GridProps extends LayoutProps {
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function Grid({
  children,
  cols = { sm: 1, md: 2, lg: 3 },
  className,
  ...props
}: GridProps) {
  const gridColsClass = clsx(
    cols.sm ? `grid-cols-${cols.sm}` : 'grid-cols-1',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : ''
  );

  return (
    <div
      className={twMerge('grid gap-4', gridColsClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Stack({
  children,
  className,
  ...props
}: LayoutProps) {
  return (
    <div
      className={twMerge('flex flex-col gap-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spacer({ size = 16, horizontal = false }) {
  return (
    <div
      style={{
        width: horizontal ? size : undefined,
        height: !horizontal ? size : undefined,
        flexShrink: 0,
      }}
    />
  );
}
