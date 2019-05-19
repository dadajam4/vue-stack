import NuxtConfiguration from '@nuxt/config';

const config: NuxtConfiguration = {
  srcDir: 'src/',

  generate: {
    dir: 'docs',
  },

  plugins: ['~/plugins/lib'],
};

export default config;
