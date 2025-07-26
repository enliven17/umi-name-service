import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { store } from '@/store';
import { theme } from '@/theme';
import { AppNavigator } from '@/navigation/AppNavigator';
import { GlobalStyles } from './styles/GlobalStyles';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppNavigator />
      </ThemeProvider>
    </Provider>
  );
};

export default App; 