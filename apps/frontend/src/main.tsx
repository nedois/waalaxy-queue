import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';

import { theme, GlobalStyle } from './theme';
import { App } from './app';

const root = ReactDOM.createRoot(document.getElementById('root') ?? document.body);

root.render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </StrictMode>
);
