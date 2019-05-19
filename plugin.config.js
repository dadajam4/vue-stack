module.exports = {
  entry: 'src/lib/index.ts',
  babel: true,
  typescript: true,
  vue: true,
  sass: true,
  postcss: true,
  autoprefixer: true,
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  commonjs: {
    namedExports: {
      'vue-mixin-decorator/dist/vue-mixin-decorator.umd.js': [
        'Mixin',
        'Mixins',
      ],
    },
  },
};
