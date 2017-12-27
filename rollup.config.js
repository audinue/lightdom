import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [{
    file: pkg.module,
    format: 'es'
  }, {
    file: pkg.main,
    format: 'umd',
    name: pkg.name
  }],
  plugins: [
    nodeResolve(),
    buble({
      jsx: 'h'
    })
  ]
};
