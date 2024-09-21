/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/typedef, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import resolve from '@rollup/plugin-node-resolve';
// eslint-disable-next-line import/no-extraneous-dependencies
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
// eslint-disable-next-line import/no-extraneous-dependencies
import glslify from 'rollup-plugin-glslify';
// eslint-disable-next-line import/no-extraneous-dependencies
import serve from 'rollup-plugin-serve';

const isServe = Boolean(process.env.SERVE);

export default {
  input: 'artifacts/hello-web-components.js',
  output: {
    dir: 'dist',
    entryFileNames: '[name].min.js',
    format: 'esm',
    sourcemap: true,
  },
  external: isServe ? [] : [/lit/],
  onwarn(warning, warn) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }
    warn(warning);
  },
  plugins: isServe
    ? [resolve(), html(), serve()]
    : [
        glslify(),
        // terser({
        //   mangle: {
        //     module: true,
        //     properties: true,
        //   },
        // }),
      ],
};
