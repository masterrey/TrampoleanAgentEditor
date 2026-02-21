import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1a1a2e',
          surface: '#16213e',
          border: '#0f3460',
          accent: '#e94560',
          text: '#e8e8e8',
        },
      },
    },
  },
  plugins: [],
}
export default config
