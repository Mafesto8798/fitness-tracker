// Theme configuration for the Fitness Tracker app
// You can easily switch between different color themes here

const themes = {
  teal: {
    name: 'Teal Theme',
    colors: {
      primary: '#1abc9c',
      primaryHover: '#16a085',
      background: '#f5f5dc',
      cardBackground: '#ffffff',
      inputBackground: '#e6e6fa',
      borderAccent: '#9370db',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
      textLight: '#95a5a6',
      white: '#ffffff',
    },
  },
  blue: {
    name: 'Blue Theme',
    colors: {
      primary: '#3498db',
      primaryHover: '#2980b9',
      background: '#ecf0f1',
      cardBackground: '#ffffff',
      inputBackground: '#e8f4f8',
      borderAccent: '#9b59b6',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
      textLight: '#95a5a6',
      white: '#ffffff',
    },
  },
  purple: {
    name: 'Purple Theme',
    colors: {
      primary: '#9b59b6',
      primaryHover: '#8e44ad',
      background: '#f4f1f9',
      cardBackground: '#ffffff',
      inputBackground: '#f0ebf8',
      borderAccent: '#3498db',
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
      textLight: '#95a5a6',
      white: '#ffffff',
    },
  },
};

// Set the active theme here
export const activeTheme = themes.teal;

// Export all themes for potential theme switcher
export const allThemes = themes;

export default activeTheme;
