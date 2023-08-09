import React, { createContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '../../types/types'
// import { useColorScheme } from 'react-native';
export interface Theme {
  colors:
  {
    driver:string,
    hitchhiker:string,
    primary: string;
    secondary: string;
    header: string;
    background: string;
    headerBackground: string,
    text: {
      primary: string;
      secondary: string;
    }
    input: {
      border: string;
      text: string;
      placeholder: string,

    }
    btn: {
      background: string,
    },
  },
  fonts:
  {
    regular: string;
    bold: string;
  },

}


// Create the theme context
interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  lightTheme: Theme;
  darkTheme: Theme;

}
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
// Create the theme provider component
function ThemeContextProvider({ children }: { children: ReactNode; }) {

  // Define the initial light mode theme
  const lightTheme: Theme = {
    colors: {
      driver: '#3498db',
      hitchhiker: '#e67e22',
      primary: '#3498db',     // Coral red
      secondary: '#c4c4c4',
      header: '#cbcbcb',
      text: {
        primary: '#000000',
        secondary: '#333333',
      },
      input: {
        border: '#c4c4c4',
        text: '#000000',
        placeholder: '#808080',
      },
      btn: {
        background: '#a4a4a4',
      },
      headerBackground: '#ffffff',
      background: '#f5f5dc ',
    },
    fonts: {
      regular: 'Roboto-Regular',
      bold: 'Roboto-Bold',
    },

  };

  // Define the dark mode theme
  const darkTheme: Theme = {
    colors: {
      driver: '#3498db',
      hitchhiker: '#e67e22',
      primary: '#e67e22',     // Coral red
      secondary: '#575752',
      header: '#3E3E3A',       // Teal green
      text: {
        primary: '#FFFFFF',   // White text
        secondary: '#B0B0B0', // Light gray text
      },
      input: {
        border: '#3E3E3A',    // Dark gray border
        text: '#FFFFFF',      // White text
        placeholder: '#B0B0B0', // Light gray placeholder text
      },
      btn: {
        background: '#303030', // Dark gray button background
      },
      headerBackground: '#222222', // Slightly darker background for header
      background: '#1E1E1E',       // Dark background
    },
    fonts: {
      regular: 'Roboto-Regular',   // Roboto Regular font
      bold: 'Roboto-Bold',         // Roboto Bold font
    },
  };

  const [theme, setTheme] = useState(lightTheme);

  const setColorScheme = async (colorScheme: ColorScheme) => {
  }
  const saveColorSchemePreference = async (colorScheme: string) => {
    try {
      await AsyncStorage.setItem('colorScheme', colorScheme);
    } catch (error) {
      // Handle the error
      console.log('Error saving color scheme preference:', error);
    }
  };
  const getColorSchemePreference = async () => {
    try {
      const colorScheme: string | null = await AsyncStorage.getItem('colorScheme');
      return colorScheme;
    } catch (error) {
      // Handle the error
      return null;
      console.log('Error retrieving color scheme preference:', error);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    lightTheme,
    darkTheme,
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export default ThemeContextProvider;