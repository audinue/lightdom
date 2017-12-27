import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';

function transform(name) {
  return {
    input: `src/${name}.js`,
    output: {
      file: `lib/${name}.js`,
      format: 'iife'
    },
    plugins: [
      nodeResolve(),
      buble({
        jsx: 'h'
      })
    ]
  }
}

export default ['counter', 'hello', 'list'].map(transform);
