import {promisify} from 'util'
import enhancedResolve from 'enhanced-resolve'
import * as moduleLexer from 'cjs-module-lexer'
import fs from 'fs'
import path from 'path'
const resolve = promisify(
    enhancedResolve.create({
      mainFields: ['browser', 'module', 'main']
    })
)
let lexerInitialized = false
async function getExports(modulePath) {
    if (!lexerInitialized) {
      await moduleLexer.init()
      lexerInitialized = true
    }
    try {
      const exports = []
      const paths = []
      paths.push(await resolve(process.cwd(), modulePath))
      while (paths.length > 0) {
        const currentPath = paths.pop()
        const results = moduleLexer.parse(await fs.readFileSync(currentPath, 'utf8'))
        exports.push(...results.exports)
        for (const reexport of results.reexports) {
          paths.push(await resolve(path.dirname(currentPath), reexport))
        }
      }
      /**
       * 追加default
       */
      if(!exports.includes('default')){
        exports.push('default')
      }
      return exports.join(', ')
    } catch (e) {
      console.log(e)
      return '*'
    }
}
const cjs_to_esm_plugin = {
    name: 'cjs-to-esm',
    setup(build) {
      build.onResolve({ filter: /.*/ }, args => {
        if (args.importer === '') return { path: args.path, namespace: 'c2e' }
      })
      build.onLoad({ filter: /.*/, namespace: 'c2e' }, async args => {
        let keys = await getExports(args.path);
        const path = JSON.stringify(args.path)
        const resolveDir = process.cwd()
        return { contents: `export { ${keys} } from ${path}`, resolveDir }
      })
    },
}
export default cjs_to_esm_plugin