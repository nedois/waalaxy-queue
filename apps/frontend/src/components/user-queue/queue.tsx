import styled, { keyframes } from 'styled-components';

export const Queue = styled.div<{ status: 'pending' | 'finished' }>`
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
    content: ${({ status }) => (status === 'pending' ? '"En attente"' : '"Terminé"')};
    color: ${({ theme, status }) => (status === 'pending' ? theme.colors.primary.main : theme.colors.primary.darker)};
  }
`;

export const QueueAction = styled.span<{ active?: boolean }>`
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

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
