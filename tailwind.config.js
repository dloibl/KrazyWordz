/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        paper: "#fff8df",
        bubblegum: "#e94178",
        aqua: "#4ecdc4",
        lemon: "#f7d44a",
        coral: "#ff6b6b",
        orange: "#ff9f1c",
      },
      fontFamily: {
        arcade: ['"Bangers"', '"Luckiest Guy"', "Impact", "sans-serif"],
        comic: ['"Fredoka"', '"Comic Neue"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        comic: "6px 6px 0 #151515",
        "comic-sm": "3px 3px 0 #151515",
      },
    },
  },
  plugins: [],
};
