/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        tea: {
          50: '#FDF8F0',
          100: '#F9EFDC',
          200: '#F2DDB8',
          300: '#E8C48A',
          400: '#DBA657',
          500: '#CF8C39',
          600: '#B8722D',
          700: '#995827',
          800: '#7D4726',
          900: '#663B22',
        },
        matcha: {
          50: '#F3F7EE',
          100: '#E3ECD8',
          200: '#C8DAB2',
          300: '#A6C084',
          400: '#87A65F',
          500: '#6B8A45',
          600: '#536D34',
          700: '#42562B',
          800: '#364527',
          900: '#2E3B23',
        },
        caramel: {
          50: '#FEF6EE',
          100: '#FCE8D5',
          200: '#F8CFAA',
          300: '#F2AE73',
          400: '#EB863B',
          500: '#E66D1F',
          600: '#D75415',
          700: '#B23E14',
          800: '#8F3318',
          900: '#742D17',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(102, 59, 34, 0.08)',
        'card-hover': '0 8px 24px rgba(102, 59, 34, 0.12)',
      },
    },
  },
  plugins: [],
};
