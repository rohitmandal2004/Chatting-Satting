/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WhatsApp Web exact color palette
        'whatsapp-green': '#25D366',
        'whatsapp-dark': '#202C33',
        'whatsapp-darker': '#111B21',
        'whatsapp-light': '#D9FDD3',
        'whatsapp-gray': '#EFEAE2',
        'whatsapp-header': '#202C33',
      },
    },
  },
  plugins: [],
}

