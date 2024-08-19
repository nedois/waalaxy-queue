import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    primary: {
      main: '#315ae7',
      darker: '#2a4da7',
      contrast: '#ffffff',
    },
    background: {
      main: '#eff0f6',
      darker: '#e0e0e0',
    },
    error: {
      main: '#f44336',
      darker: '#d32f2f',
      contrast: '#ffffff',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
};
