import styled, { keyframes } from 'styled-components';
import type { QueueActionProps } from './user-queue.types';

export const QueueRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background.main};
  border: ${({ theme }) => `1px solid ${theme.colors.background.darker}`};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-width: 480px;
  width: 100%;
`;

export const Queue = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: ${({ theme }) => `1px dashed ${theme.colors.primary.main}`};
  border-radius: ${({ theme }) => theme.radius.md};
  display: flex;
  overflow-x: auto;
  gap: ${({ theme }) => theme.spacing.md};

  &::before {
    flex-shrink: 0;
    font-weight: bold;
    width: 78px;
    margin-right: ${({ theme }) => theme.spacing.md};
    content: 'En attente';
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

export const QueueAction = styled.span<QueueActionProps>`
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, idle }) => (idle ? theme.colors.error.main : 'inherit')};

  &::before {
    display: ${({ active }) => (active ? 'block' : 'none')};
    position: absolute;
    content: '';
    width: 24px;
    height: 24px;
    border-radius: 100%;
    border: ${({ theme }) => `2px solid ${theme.colors.primary.main}`};
    border-top-color: transparent;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-name: ${keyframes`
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    `};
  }
`;
