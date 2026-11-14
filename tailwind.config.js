/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nasa: {
          black: '#000000',
          dark: '#0B0D10',
          surface: '#11141A',
          blue: '#15418C',
          'blue-dark': '#0E2A5C',
          red: '#E4002B',
          'red-hover': '#B80022',
        },
        earthdata: {
          blue: '#1967D2',
          'blue-hover': '#1557B0',
          'blue-light': '#E8F0FE',
          cyan: '#0072BC',
          amber: '#D97706',
          emerald: '#059669',
          bg: '#F6F6F6',
          white: '#FFFFFF',
          border: '#E0E0E0',
          'border-light': '#EEEEEE',
          text: '#1B1B1B',
          meta: '#58585B',
          muted: '#717174',
          tag: '#EBEBEB',
        },
      },
      fontFamily: {
        display: [
          'Inter',
          'Public Sans',
          '-apple-system',
          'sans-serif',
        ],
        body: [
          'Public Sans',
          'Inter',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'DM Mono',
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}
