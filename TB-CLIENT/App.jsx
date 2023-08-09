
import Main from './src/Pages/Main';
import { RidesContextProvider } from './src/context/RidesContext';
import { UserContextProvider } from './src/context/UserContext';
import { TranslationProvider } from './src/styles/Languages/Languages';
import ThemeContextProvider from './src/styles/Themes/ThemeContext';

import React, { useEffect } from 'react';
export default function App() {

  
  return (
    <UserContextProvider>
      <RidesContextProvider>
        <TranslationProvider>
          <ThemeContextProvider>
            <Main />
          </ThemeContextProvider>
        </TranslationProvider>
      </RidesContextProvider>
    </UserContextProvider>
  );
}
