/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        seurat: ["FOT-SeuratProB", "sans-serif"],
      },
      colors: {
        background: "#F2E269",
        infoBorder: "#EC9A4E",
        buttonBg: "#4A79D6",
        buttonBgClick: "#2d4c8a",
        buttonBgHover: "#5d90f5",
        buttonStroke: "#121D37",
        red: "#FF5858",
        green: "#9DFF3B",
        darkGreen: "#42982D",
        boardBg:"#6E95E1"
      },
    },
  },
  plugins: [],
};
