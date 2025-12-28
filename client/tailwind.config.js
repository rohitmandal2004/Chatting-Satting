/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp-inspired color palette
        'whatsapp-green': '#25D366',
        'whatsapp-dark': '#128C7E',
        'whatsapp-darker': '#075E54',
        'whatsapp-light': '#DCF8C6',
        'whatsapp-gray': '#ECE5DD',
      },
    },
  },
  plugins: [],
}

