import { Theme } from "../styles/Themes/ThemeContext";
export type TitleStyles = {
  fontWeight: 'bold';
  color: string;
  textAlign: 'center';
  fontSize: number;
  marginVertical: number;
};

export const title = (isDriver: boolean, theme: Theme) => {
  return {
    fontWeight: 'bold' as const, 
    color: isDriver ? theme?.colors?.driver : theme?.colors?.hitchhiker,
    textAlign: 'center' as const, 
    fontSize: 24,
    marginVertical: 10,
  };
};