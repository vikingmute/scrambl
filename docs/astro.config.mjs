import react from '@astrojs/react'
import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

const isDevServer = process.argv.includes('dev')

export default defineConfig({
  site: 'https://scrambl.vikingz.me',
  vite: {
    cacheDir: isDevServer ? './node_modules/.vite-dev' : './node_modules/.vite-build',
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
  integrations: [
    react(),
    starlight({
      title: 'Scrambl',
      description:
        'Zero-dependency text scramble animation library for Vanilla JS, React, and Vue.',
      social: {
        github: 'https://github.com/vikingmute/scrambl',
      },
      components: {
        ThemeProvider: './src/components/DarkThemeProvider.astro',
        ThemeSelect: './src/components/EmptyThemeSelect.astro',
      },
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon.svg',
            type: 'image/svg+xml',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'icon',
            href: '/favicon-32.png',
            sizes: '32x32',
            type: 'image/png',
          },
        },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/guides/installation/' },
            { label: 'Quick Start', link: '/guides/quick-start/' },
            { label: 'llms.txt', link: '/llms.txt' },
          ],
        },
        {
          label: 'Core API',
          items: [
            { label: 'scramble()', link: '/api/scramble/' },
            { label: 'createScrambler()', link: '/api/create-scrambler/' },
            { label: 'Options', link: '/api/options/' },
            { label: 'Character Sets', link: '/api/charsets/' },
            { label: 'Easing Functions', link: '/api/easing/' },
          ],
        },
        {
          label: 'Frameworks',
          items: [
            { label: 'React', link: '/frameworks/react/' },
            { label: 'Vue', link: '/frameworks/vue/' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Demo Lab', link: '/examples/demo-lab/' },
            { label: 'Recipes', link: '/examples/recipes/' },
          ],
        },
      ],
    }),
  ],
})
