import { terser } from "rollup-plugin-terser";
export default {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js', // rollup支持的多种输出格式(有amd,cjs, es, iife 和 umd)
      format: 'cjs',
    },
    plugins:[terser()]
  }