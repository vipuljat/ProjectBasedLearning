/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ment-ai-background': '#0C111D',
                'ment-ai-secondary': '#0095FF',
                'ment-ai-white': '#F2F2F2',
                'ment-ai-purple': '#3B22CE',
                'ment-ai-grey': '#2D2E34',
                'ment-ai-highlight': '#141824',
                'ment-ai-hover1': '#191C27',
            },
        },

    },
    plugins: [],
}
// 'ment-ai-highlight': '#111827',
