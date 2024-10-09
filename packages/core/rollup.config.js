/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/typedef, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import glslify from 'rollup-plugin-glslify';

const isServe = Boolean(process.env.SERVE);

const config = [
  {
    input: 'artifacts/sketch-paper.js',
    output: {
      name: 'SketchPaper',
      dir: 'dist',
      entryFileNames: '[name].min.js',
      format: 'es',
      sourcemap: true,
    },
    external: isServe ? [] : [/lit/],
    onwarn(warning, warn) {
      if (warning.code === 'THIS_IS_UNDEFINED') {
        return;
      }
      warn(warning);
    },
    plugins: [
      replace({
        '@lastolivegames/becsy': '@lastolivegames/becsy/perf',
        preventAssignment: true,
      }),
      glslify(),
      nodeResolve(),
      commonjs(),
      // terser(),
    ],
  },
  {
    input: './artifacts/sketch-paper.d.ts',
    output: [{ file: 'dist/sketch-paper.d.ts', format: 'esm' }],
    plugins: [dts()],
  },
];

export default config;
