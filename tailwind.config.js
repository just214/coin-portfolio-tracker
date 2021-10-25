module.exports = {
  mode: "jit",
  purge: [
    "src/pages/**/*.{js,ts,jsx,tsx}",
    "src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transblack: "rgba(0,0,0,.1)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
