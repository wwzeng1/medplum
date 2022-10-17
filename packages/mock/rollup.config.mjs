import json from '@rollup/plugin-json';
import { mkdirSync, writeFileSync } from 'fs';
import esbuild, { minify } from 'rollup-plugin-esbuild';

const globals = {
  '@medplum/core': 'medplum.core',
  '@medplum/fhir-router': 'medplum.fhirRouter',
  rfc6902: 'rfc6902',
};

const sourcemapPathTransform = (path) => path.replaceAll('\\', '/').replaceAll('../../../src', '../../src');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.cjs',
        format: 'umd',
        name: 'medplum.mock',
        sourcemap: true,
        sourcemapPathTransform,
        globals,
      },
      {
        file: 'dist/cjs/index.min.cjs',
        format: 'umd',
        name: 'medplum.mock',
        plugins: [minify()],
        sourcemap: true,
        sourcemapPathTransform,
        globals,
      },
    ],
    plugins: [
      json(),
      esbuild(),
      {
        buildEnd: () => {
          mkdirSync('./dist/cjs', { recursive: true });
          writeFileSync('./dist/cjs/package.json', '{"type": "commonjs"}');
        },
      },
    ],
    external: Object.keys(globals),
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist/esm',
        entryFileNames: '[name].mjs',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: true,
        sourcemapPathTransform,
      },
      {
        file: 'dist/esm/index.min.mjs',
        format: 'esm',
        plugins: [minify()],
        sourcemap: true,
        sourcemapPathTransform,
      },
    ],
    plugins: [
      json(),
      esbuild(),
      {
        buildEnd: () => {
          mkdirSync('./dist/esm/node_modules/tslib', { recursive: true });
          writeFileSync('./dist/esm/package.json', '{"type": "module"}');
          writeFileSync('./dist/esm/node_modules/tslib/package.json', '{"type": "module"}');
        },
      },
    ],
    external: Object.keys(globals),
  },
];
