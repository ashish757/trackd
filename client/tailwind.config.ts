/** @type {import('tailwindcss').Config} */
export default {
    // Ensure 'dark' mode is configured
    darkMode: 'class',
    content: [
        // Point this to all your React component files
        './index.html',
        './src/**/*.{tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Custom Colors
                primary: "rebeccapurple",       // your main accent color
                secondary: "#ff6b6b",
            },
            fontFamily: {
                // Custom Font
            },
            borderRadius: {
                // Custom Border Radii
            },
        },
    },

}