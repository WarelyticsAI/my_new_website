import nextConfig from "eslint-config-next"

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "generated/**"],
  },
  ...nextConfig,
  {
    rules: {
      // Allow setState in useEffect for common patterns like client-side hydration checks
      // and dialog state reset on close
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default eslintConfig
