import NuxtConfiguration from '@nuxt/config';

const config: NuxtConfiguration = {
  srcDir: 'src/',

  server: {
    host: '0.0.0.0',
  },

  generate: {
    dir: 'docs',
  },

  plugins: ['~/plugins/lib'],
};

export default config;
