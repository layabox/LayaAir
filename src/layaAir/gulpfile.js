let gulp = require('gulp');
var typedoc = require("gulp-typedoc");
 
gulp.task("default", function() {
    return gulp
        .src(["laya/**/*.ts"])
        .pipe(typedoc({
            // TypeScript options (see typescript docs)
            module: "commonjs",
            target: "es6",
            includeDeclarations: false,
 
            mode: "modules",                   
            // Output options (see typedoc docs)
            out: "./out",
            json: "output/to/file.json",
            includes: "./",
            entryPoint: "./",
 
            // TypeDoc options (see typedoc docs)
            name: "my-project",
            theme: "default",
            plugins: ["my", "plugins"],
            ignoreCompilerErrors: false,
            version: true,
        }))
    ;
});