import styled from 'styled-components';

export const PageLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;

  &::before {
    content: '';
    border: 2px solid ${({ theme }) => theme.colors.primary.main};
    border-top: 22px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;
