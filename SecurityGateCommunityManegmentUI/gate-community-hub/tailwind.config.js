const { Container } = require("postcss");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Your brand blue
        secondary: "#f59e42", // Your brand orange
        accent: "#10b981", // Accent color
        background: "#f8fafc", // Light background
        surface: "#ffffff", // Card/Surface
        muted: "#64748b", // Muted text
        danger: "#ef4444", // Error/Destructive
        success: "#22c55e", // Success
        warning: "#facc15", // Warning
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          xs: "2rem",
          sm: "1rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "4rem",
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add other plugins if needed
  ],
};
