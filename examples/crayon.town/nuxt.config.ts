// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  css: ['~/assets/style.css'],
  tailwindcss: {
    config: {
      theme: {
        colors: {
          white: '#ffffff',
          black: '#000000',
          transparent: 'transparent',
          primary: '#82e994',
          gray: '#d9d9d9',
        },
      },
    },
  },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-svgo'],
  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('sketch-paper'),
    },
  },
});
