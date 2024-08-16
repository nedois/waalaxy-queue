import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }
`;
