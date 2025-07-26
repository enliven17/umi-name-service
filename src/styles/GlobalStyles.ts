import { createGlobalStyle } from 'styled-components';
import { theme } from '@/theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.fonts.family.primary};
    font-size: ${theme.fonts.size.base};
    line-height: ${theme.fonts.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${theme.fonts.weight.semibold};
    line-height: ${theme.fonts.lineHeight.tight};
  }

  p {
    margin: 0;
  }

  a {
    color: ${theme.colors.primary[500]};
    text-decoration: none;
    transition: color 0.2s ease-in-out;
    
    &:hover {
      color: ${theme.colors.primary[600]};
    }
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  #root {
    min-height: 100vh;
  }
`; 