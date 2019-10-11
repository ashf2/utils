var gulp = require('gulp');
var typedoc = require("gulp-typedoc");
const browserSync = require('browser-sync').create();
 

const runTypeDoc = () => gulp
  .src(["src/**/*.ts"])
  .pipe(typedoc({
    exclude:["node_modules",
            "**/*+(index|.worker|.e2e).ts"],
    // TypeScript options (see typescript docs)
    module: "commonjs",
    target: "es5",
    includeDeclarations: false,

    // Output options (see typedoc docs)
    out: "./docs",

    // TypeDoc options (see typedoc docs)
    name: "my-project",
    ignoreCompilerErrors: true,
    version: true,
  }))

const reload = (done) => {
  browserSync.reload();
  done()
}
const runBrowserSync = (done) => {
  browserSync.init({
    server: {
        baseDir: './docs',
        reloadDelay:1000
    },
  })
  done()
}

const watch = () => gulp.watch(
  ['README.md', 'src/**/*.ts'],
  gulp.series(runTypeDoc, reload)
)

gulp.task('default', gulp.series(runTypeDoc, runBrowserSync, watch))
