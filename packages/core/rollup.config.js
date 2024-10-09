import alias from '@rollup/plugin-alias'; // Alias plugin
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import glslify from 'rollup-plugin-glslify';

const isServe = Boolean(process.env.SERVE);

const config = [
  {
    input: 'src/sketch-paper.ts',
    output: {
      name: 'SketchPaper',
      dir: 'dist',
      entryFileNames: '[name].min.js',
      format: 'esm',
      sourcemap: true,
    },
    external: isServe ? [] : [/lit/, 'pixi.js'],
    // onwarn(warning, warn) {
    //   if (warning.code === 'THIS_IS_UNDEFINED') {
    //     return;
    //   }
    //   warn(warning);
    // },
    plugins: [
      alias({
        entries: [
          { find: 'pixi.js', replacement: 'pixi.js/dist/pixi.mjs' }, // Ensuring the correct pixi.js path
        ],
      }),
      replace({
        '@lastolivegames/becsy': '@lastolivegames/becsy/perf',
        preventAssignment: true,
      }),
      glslify(),
      resolve({
        exportConditions: ['module', 'import'],
        moduleDirectories: ['node_modules'],
      }),
      commonjs(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      // terser(),
    ],
  },
];

export default config;
