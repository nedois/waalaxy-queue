import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { QueryClientProvider } from 'react-query';

import { theme, GlobalStyle } from './theme';
import { queryClient } from './services';
import { App } from './app';

const root = ReactDOM.createRoot(document.getElementById('root') ?? document.body);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
