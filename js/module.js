tailwind.config = {
  theme: {
    extend: {
      animation: {
        typing: 'typing 1.5s steps(90) 1.5s 1 normal both, cursor 1s step-end infinite',
      },
      keyframes: {
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        cursor: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: 'currentColor' },
        },
      },
      colors: {
        // Monokrom
        'off-white': '#F5F5F5',
        'soft-black': '#121212',
        'light-gray': '#D3D3D3',
        'medium-gray': '#8A8A8A',
        'dark-gray': '#3E3E3E',
        'darker-gray': '#1A1A1A',

        // Aksen
        'accent-blue': '#6B7F9A',
        'accent-sage': '#B3C09E',
        'accent-mustard': '#D4A017',
        'accent-wine': '#D16A76',
        'accent-lavender': '#C6B2C3',
      }
    }
  }
};

// Initialize Lucide icons

lucide.createIcons();

