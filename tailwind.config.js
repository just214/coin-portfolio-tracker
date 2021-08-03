module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transblack: "rgba(0,0,0,.05)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
