const fs = require('fs');

module.exports = {
  configureWebpack() {
    return {
      devtool: 'source-map',
      plugins: [{
        apply(compiler) {
          compiler.hooks.thisCompilation.tap('Initializing Compilation', (compilation) => {
            compilation.hooks.finishModules.tapPromise('All Modules Built', async (modules) => {
              for (const module of modules) {
                const { resource } = module;
            
                // If "resource" is not set, ignore this module
                if (!resource) continue;
            
                // Ignore all modules that originated from the "node_modules" directory
                if (/node_modules/.test(resource)) continue;
            
                // Ignore all non-Single File Component files
                if (!/\.vue/.test(resource)) continue;
            
                // If this module is not of the script type, we should ignore it
                if (!/type=script/.test(resource)) continue;
            
                // Remember that we want to leave JavaScript Single File Components alone
                if (!/lang=ts/.test(resource)) continue;
            
                // For Vue CLI v4, each module's source map will be held in "module._source._sourceMap".
                // For Vue CLI v5, each module's source map will be held in "module._source._sourceMapAsObject".
                // If this module does not contain a source map, we should ignore it
                if (!module['_source'] || (!module['_source']['_sourceMap'] && !module['_source']['_sourceMapAsObject'])) continue;
            
                // If we've come this far, this is a module that we are interested in.
                const pathWithoutQuery = module.resource.replace(/\?.*$/, '');

                // Note: You may need to use a different encoding (i.e. other than 'utf-8') if you
                // use Unicode characters directly in your source code files
                const sourceFile = fs.readFileSync(pathWithoutQuery).toString('utf-8');
                
                // Remember that the source file is stored in a slightly different place on Vue CLI 5
                const sourceMap = module['_source']['_sourceMap'] || module['_source']['_sourceMapAsObject'];

                sourceMap.sources = [pathWithoutQuery];
                sourceMap.sourcesContent = [sourceFile];

              }
            });
          });
        }
      }]
    };
  }
};
