import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled from 'styled-components';

const Root = styled.button`
  color: ${({ theme }) => theme.colors.primary.contrast};
  background-color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radius.md};
  border: none;
  cursor: pointer;

  &:hover {
    transition: all 0.2s;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.primary.darker};
  }
`;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return <Root {...props}>{children}</Root>;
}
