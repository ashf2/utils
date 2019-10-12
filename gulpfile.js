var gulp = require('gulp');
// 创建实例并允许创建多个服务器或代理。
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
// gulp server命令
gulp.task('server', function() {
    nodemon({
        script: 'server.js',
        // 忽略部分对程序运行无影响的文件的改动，nodemon只监视js文件，可用ext项来扩展别的文件类型
        ignore: ["gulpfile.js", "node_modules/", "public/**/*.*"],
        ext: 'ts',
        env: {
            'NODE_ENV': 'development'
        }
    }).on('start', function() {
        browserSync.init({
            proxy: 'http://localhost:10015',
            files: ["docs/index.html"],
            port: 10015
        }, function() {
            console.log("browser refreshed.");
        });
        // 重新生成docs文件后刷新浏览器
        gulp.watch("docs/*.*").on('change', reload);
    })
});
