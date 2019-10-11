##### typescript 创建包编写包发布包流程
- 初始化
- 修改 tsconfig.json 配置
- husky构建代码检查
- 配置typedoc
  - 安装typedoc
  - 配置glupfile.js
  - 配置nginx
  - 添加自动刷新文档功能
- 编写插件代码
  - 方法库
  - 组件
- 添加单元测试
  - 方法测试
  - 组件测试
- 发布


##### 初始化

```
创建远程仓库
git clone https://github.com/xxx/xxx.git
npm init -y
npm i typescript -D
tsc --init
```
##### 修改 tsconfig.json 配置
---

```
{
  "compilerOptions": {
    "declaration": true,
    "target": "es6",
    "module": "es6",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "typedocOptions": {
    "mode": "modules",
    "out": "docs",
    "target": "es6",
    "theme": "default",
    "isolatedModules": false, //将每个文件作为单独的模块。
  },
  "include": [".tmp/**/*"],
  "exclude": ["node_modules"]
}

```
##### husky构建代码检查

```
//安装 美化代码库prettier，代码检查库tslint。注：prettier某些配置会和tslint冲突，有些配置需要统一
npm i prettier tslint tslint-config-prettier -D
```
##### 配置doc

```
// 1.安装相关插件
npm i -D gulp typedoc gulp-typedoc

// 2.配置gulpfile.js
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

// 配置nginx
{
    listen 10015;
    server_name  127.0.0.1;
    location / {
      root /Users/jf/Documents/packages/utils/doc;
      index index.html index.htm;
    }
}

//文档修改后监听自动刷新
- 使用gulp

```
##### 编写插件代码



