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
                'primary': '#5211d4',
                'background-light': '#f6f6f8',
                'background-dark': '#161022',
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