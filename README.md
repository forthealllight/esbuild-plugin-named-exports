# esbuild-plugin-named-exports
a esbuild plugion to reexport  some named exports

**This plugion is used for reexport some named exports.when we change cjs to esm，we can use this plugin**

 1. Example
we want to change from 'cjs' to 'esm'
default in esbuild:

        //a.js
        module.exports.x = 1
        module.exports.y = 2
        
        //index.js
        module.exports = require('./a.js')
    
after bundle in esbuild, output is:
        
        //bundle.js
        var require_a = __commonJS((exports, module) => {
          module.exports.x = 1;
          module.exports.y = 2;
        });
        
        var require_test = __commonJS((exports, module) => {
          module.exports = require_a();
        });
        export default require_test();
        
you will see that in the bundle.js, it only has "default", there is not namedExports, "export x" and "export".

 2. my plugin 
 
based on cjs-module-lexer, this plugin can detect all namedExports.

use:

    const esbuldNamedExportsPlugin = require('esbuild-plugin-named-exports')
     ...
     
     require('esbuild').build({
    entryPoints: ['./test.js'],
        bundle: true,
        outdir: 'bundle',
        format: 'esm',
        target: 'es2017',
        plugins:[esbuldNamedExportsPlugin]   
    })
    

use this plugin, the bundle.js will be:

        //bundle.js
        var require_a = __commonJS((exports, module) => {
          module.exports.x = 1;
          module.exports.y = 2;
        });
        var require_test = __commonJS((exports, module) => {
          module.exports = require_a();
        });
        var import_test = __toModule(require_test());
        var export_default = import_test.default;
        var export_x = import_test.x;
        var export_y = import_test.y;
        export {
          export_default as default,
          export_x as x,
          export_y as y
        };

you will see that is has the reexport namedExports, "export x" & "export y"
