import styled from 'styled-components';
import type { ButtonProps } from './button.types';

export const ButtonRoot = styled.button<ButtonProps>`
  display: flex;
  height: fit-content;
  gap: ${({ theme }) => theme.spacing.xs};
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

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }
`;

export const ButtonLoader = styled.div`
  display: inline-block;
  width: ${({ theme }) => theme.spacing.md};
  height: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.primary.contrast};
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
