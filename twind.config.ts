import { apply, silent } from "twind";
import { orange } from "twind/colors";

export default {
  plugins: {
    applydark: apply`dark:(bg-gray-900 text-white) bg-white text-gray-800`,
  },
  preflight: {
    body: apply`applydark`,
  },
  mode: silent,
  theme: {
    extend: {
      fontSize: {
        xxs: "11px",
      },
      colors: {
        transblack: "rgba(0,0,0,.1)",
        orange,
      },
    },
  },
};
