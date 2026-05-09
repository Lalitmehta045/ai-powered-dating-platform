/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0F13",
        card: "#18181F",
        border: "#2A2A35",
        primary: {
          DEFAULT: "#FF4D6D",
          hover: "#E63E5C",
        },
        secondary: {
          DEFAULT: "#7B61FF",
          hover: "#6A52E5",
        },
        success: "#22C55E",
        danger: "#EF4444",
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B3C0",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        accent: ['Outfit', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
