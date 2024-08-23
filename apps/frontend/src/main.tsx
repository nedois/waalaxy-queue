import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './api';
import { App } from './app';
import { GlobalStyle, theme } from './theme';

const root = ReactDOM.createRoot(document.getElementById('root') ?? document.body);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
