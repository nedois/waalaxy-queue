import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: {
        main: string;
        darker: string;
        contrast: string;
      };
      background: {
        main: string;
        darker: string;
      };
      error: {
        main: string;
        darker: string;
        contrast: string;
      };
    };

    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };

    radius: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
