/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        heard: {
          bg: '#faf8f3',
          bg2: '#f3efe7',
          ink: '#1a1a1a',
          muted: '#666666',
          faint: '#999999',
          hair: 'rgba(26,26,26,0.08)',
          rust: '#c2410c',
          'rust-soft': '#fff3e6',
        },
        streamer: {
          netflix: '#E50914',
          prime: '#00A8E1',
          appletv: '#1a1a1a',
          max: '#002BE7',
          hulu: '#1CE783',
          disney: '#113CCF',
          peacock: '#0047AB',
        },
      },
      fontFamily: {
        serif: ['Fraunces_500Medium', 'Fraunces_400Regular', 'Georgia', 'serif'],
        'serif-italic': ['Fraunces_500Medium_Italic', 'Fraunces_400Regular_Italic', 'Georgia', 'serif'],
        sans: ['Inter_400Regular', '-apple-system', 'system-ui', 'sans-serif'],
        'sans-medium': ['Inter_500Medium', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', 'ui-monospace', 'monospace'],
        'mono-medium': ['JetBrainsMono_500Medium', 'ui-monospace', 'monospace'],
        'mono-bold': ['JetBrainsMono_700Bold', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // serif (editorial)
        'h-display': ['38px', { lineHeight: '1' }],
        'h-modal': ['22px', { lineHeight: '1.15' }],
        'h-large': ['18px', { lineHeight: '1.2' }],
        'h-sub': ['15px', { lineHeight: '1.25' }],
        'h-small': ['13px', { lineHeight: '1.3' }],
        'h-body': ['12px', { lineHeight: '1.45' }],
        'h-footer': ['11.5px', { lineHeight: '1.45' }],
        // mono (UI)
        'm-label': ['8px', { lineHeight: '1.1' }],
        'm-button-sm': ['9px', { lineHeight: '1.1' }],
        'm-button': ['10px', { lineHeight: '1.1' }],
        'm-display': ['14px', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        'tight-1': '-0.01em',
        'tight-2': '-0.02em',
        'tight-3': '-0.03em',
        'tight-35': '-0.035em',
        'wide-1': '0.1em',
        'wide-12': '0.12em',
        'wide-15': '0.15em',
        'wide-18': '0.18em',
        'wide-2': '0.2em',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '7.5': '30px',
        '15': '60px',
      },
      borderRadius: {
        'tight': '3px',
        'card': '4px',
        'avatar': '8px',
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0,0,0,0.08)',
        'card': '0 4px 14px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
