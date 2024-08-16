import type { ReactNode } from 'react';

export interface FlexProps {
  children: ReactNode;
  gap?: number;
  direction?: 'row' | 'column';
  grow?: boolean;
  center?: boolean;
  wrap?: boolean;
  mt?: number;
}
