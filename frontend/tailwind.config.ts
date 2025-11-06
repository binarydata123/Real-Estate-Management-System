import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"], // default body font
                heading: ["var(--font-roboto)", "sans-serif"], // example heading font
            },
        },
    },
    plugins: [],
};

export default config;
