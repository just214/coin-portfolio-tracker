import { apply } from "twind";

export default {
  mode: "silent",
  plugins: {
    applydark: apply`dark:(bg-gray-900 text-white) bg-white text-gray-800`,
  },
  preflight: {
    body: apply`applydark`,
  },
  theme: {
    extend: {
      fontSize: {
        xxs: "11px",
      },
      colors: {
        transblack: "rgba(0,0,0,.1)",
      },
    },
  },
};
