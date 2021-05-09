import { apply } from "twind";

export default {
  preflight: {
    body: apply`bg-gray-900 text-white`,
  },
  theme: {
    extend: {
      fontSize: {
        xxs: "11px",
      },
    },
  },
};
