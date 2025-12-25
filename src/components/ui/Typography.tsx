import React from 'react';
import { cn } from '../../utils/cn';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'subtitle1'
  | 'subtitle2'
  | 'caption'
  | 'overline'
  | 'label';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'inherit'
  | 'slate-900'
  | 'slate-700'
  | 'slate-600'
  | 'slate-500';

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';

export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

export interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: TypographyAlign;
  weight?: TypographyWeight;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  noWrap?: boolean;
  gutterBottom?: boolean;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'text-4xl md:text-5xl font-bold leading-tight',
  h2: 'text-3xl md:text-4xl font-bold leading-tight',
  h3: 'text-2xl md:text-3xl font-semibold leading-snug',
  h4: 'text-xl md:text-2xl font-semibold leading-snug',
  h5: 'text-lg md:text-xl font-medium leading-normal',
  h6: 'text-base md:text-lg font-medium leading-normal',
  body1: 'text-base leading-relaxed',
  body2: 'text-sm leading-relaxed',
  subtitle1: 'text-lg font-medium leading-normal',
  subtitle2: 'text-base font-medium leading-normal',
  caption: 'text-xs leading-tight',
  overline: 'text-xs uppercase tracking-wide font-medium leading-tight',
  label: 'text-sm font-medium leading-normal',
};

const variantElements: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  subtitle1: 'h6',
  subtitle2: 'h6',
  caption: 'span',
  overline: 'span',
  label: 'label',
};

const colorStyles: Record<TypographyColor, string> = {
  primary: 'text-gray-900',
  secondary: 'text-gray-700',
  muted: 'text-gray-500',
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-orange-600',
  info: 'text-blue-600',
  inherit: 'text-inherit',
  'slate-900': 'text-slate-900',
  'slate-700': 'text-slate-700',
  'slate-600': 'text-slate-600',
  'slate-500': 'text-slate-500',
};

const alignStyles: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

const weightStyles: Record<TypographyWeight, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight,
  className,
  children,
  as,
  noWrap = false,
  gutterBottom = false,
}) => {
  const Component = as || variantElements[variant];

  const classes = cn(
    variantStyles[variant],
    colorStyles[color],
    alignStyles[align],
    weight && weightStyles[weight],
    noWrap && 'truncate',
    gutterBottom && 'mb-4',
    className
  );

  return <Component className={classes}>{children}</Component>;
};

// Convenience components for common use cases
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const H5: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h5" {...props} />
);

export const H6: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h6" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="label" {...props} />
);
