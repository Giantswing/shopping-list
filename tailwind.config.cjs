/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')

module.exports = {
   content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
   ],

   theme: {
      fluidTypography: {
         remSize: 16,
         minScreenSize: 320,
         maxScreenSize: 1920,
         minTypeScale: 1.2,
         maxTypeScale: 1.33,
         lineHeight: 1.35
      },

      extend: {
         transitionTimingFunction: {
            'elastic': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            'elastic-strong': 'cubic-bezier(0.68, -0.75, 0.27, 1.75)',
            'elastic-weak': 'cubic-bezier(0.68, -0.35, 0.27, 1.35)',
            'elastic-out-strong': 'cubic-bezier(0.68, -0.75, 0.27, 1.75)',
            'elastic-out-weak': 'cubic-bezier(0.68, -0.35, 0.27, 1.35)',
            'elastic-in-strong': 'cubic-bezier(0.68, -0.75, 0.27, 1.75)',
            'elastic-in-weak': 'cubic-bezier(0.68, -0.35, 0.27, 1.35)',
         },

         containers: {
            '2xs': '16rem',
            '3xs': '10rem',
         },

         colors: {
            'mh-accent': '#92F8EA',
            'mh-green': '#009483',
            'mh-orange-light': '#EDB183',
            'mh-orange': '#E3843B',
            'mh-red': '#F15152',
            'mh-blue': '#255C99',
            'blue-active': '#009483',
            'blue-secondary': '#CFEDE8',
            'mh-green-dark': '#253031',
            'mh-green-light': '#EBF7F5',
            'mh-yellow': '#FFD558',
            'mh-black': '#212121',
            'mh-gray': '#E0E0E0',
            'mh-gray-light': '#FAFAFA',
         },

         boxShadow: {
            'tab': '-1px 7px 6px -2px rgba(199, 200, 214, 1)',
            'container': '-1px 7px 6px -2px rgba(199, 200, 214,1)'
         },

         maxHeight: {
            'modal': '90%'
         },

         fontFamily: {
            sans: ['Poppins', 'sans-serif'],
         },

         textShadow: {
            sm: '0 1px 2px var(--tw-shadow-color)',
            DEFAULT: '0 2px 4px var(--tw-shadow-color)',
            lg: '0 8px 16px var(--tw-shadow-color)',
         },
      },
   },

   plugins: [
      require("tailwind-fluid-typography"),
      require('@tailwindcss/container-queries'),
      plugin(function ({ matchUtilities, theme }) {
         matchUtilities(
            {
               'text-shadow': (value) => ({
                  textShadow: value,
               }),
            },
            { values: theme('textShadow') }
         )
      }),
   ],
};
