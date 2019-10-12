##### typescript 构建编写发布包流程
- 初始化
- 修改 tsconfig.json 配置
- husky构建代码检查
  - 安装husky，tslint， prettier
  - 配置tslint， prettier
- 配置typedoc
  - 安装typedoc
  - 生成docs文档
  - 配置nginx
  - 添加自动刷新文档功能
    - 安装gulp-nodemon， browser-sync 
    - 配置glupfile.js
    - 编写server.js
- 编写插件代码
  - 方法库
  - 组件
- 添加单元测试
  - 方法测试
  - 组件测试
- tsc 打包
  - 分文件打包
  - 按需加载
- 发布到 npm


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
// 1.安装 美化代码库prettier，代码检查库tslint。注：prettier某些配置会和tslint冲突，有些配置需要统一
npm i prettier tslint tslint-config-prettier -D

 // 2.添加tslint配置
 {
  "extends": ["tslint:recommended", "tslint-config-prettier"],
  "rules": {
    "no-console": false,
    "object-literal-sort-keys": false,
    "member-access": false,
    "ordered-imports": false
  },
  "linterOptions": {
    "exclude": ["**/*.json", "node_modules"]
  }
}

// 3.添加.perttierrc配置
{
  "trailingComma": "all",
  "tabWidth": 4,
  "semi": false,
  "singleQuote": true,
  "endOfLine": "lf",
  "printWidth": 120,
  "overrides": [
    {
      "files": ["*.md", "*.json", "*.yml", "*.yaml"],
      "options": {
        "tabWidth": 2
      }
    }
  ]
}

// 4.package.json添加相关内容
script: {
    ...,
    "format": "prettier --write \"src/**/*.ts\" \"src/**/*.js\"",
    "lint": "tslint -p tsconfig.json",
    ...
}
...
"husky": {
    "hook": {
      "pre-commit": [
        "lint"
      ]
    }
 }
 

```
##### 配置doc

```
// 1.安装相关插件
npm i -D gulp typedoc gulp-typedoc


// 2.生成docs文件命令
typedoc src //即将src下的文件生成文档默认生成文档文件夹为docs


// 3.配置nginx
{
    listen 10015;
    server_name  127.0.0.1;
    location / {
      root docs目录
      index index.html index.htm;
    }
}

//文档修改后监听自动刷新，使用browser-sync，gulp-nodemon
  // 1.安装插件
  npm i -D gulp-nodemon browser-sync
  // 2.编写glupfile.js
  var gulp = require('gulp');
  /* 创建实例并允许创建多个服务器或代理。*/
  var browserSync = require('browser-sync').create();
  var reload = browserSync.reload;
  var nodemon = require('gulp-nodemon');
  /* gulp server命令*/
  gulp.task('server', function() {
    nodemon({
        script: 'server.js',
        /* 忽略部分对程序运行无影响的文件的改动，nodemon只监视js文件，可用ext项来扩展别的文件类型*/
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
        /* 重新生成docs文件后刷新浏览器*/
        gulp.watch("docs/*.*").on('change', reload);
    })
  });
  
  // 3.编写server.js
  
    const http = require('http')
    const cp = require('child_process');
    const chalk = require('chalk')
    
    const port     = 10016
    const hostname = 'localhost';
    const browserSync = require('browser-sync').create();

    /*检测端口是否被占用*/
    function portIsOccupied() {
      const server = net.createServer().listen(port)
      return new Promise((resolve, reject) => {
        server.on('listening', () => {
          server.close()
          resolve()
        })
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(chalk.green(`${port}端口已占用，尝试使用${port + 1}端口...`))
            port++
            resolve(portIsOccupied())
          } else {
            console.error('发生错误：', err);
            reject(err)
          }
        })
      })
    }

    http.createServer()
      .listen(port, hostname, () => {
        console.info(`listening on http://${hostname}:${port}`)
        cp.spawn(`yarn`, ['build:doc'], { cwd: process.cwd(), stdio: 'inherit' }, (err, stdout, stderr) => {
          if (err || stderr !== '\n') {
            console.warn('更新失败：', err, '\n', stderr);
            return;
          }
          console.log(chalk.green('更新完成'));
        });
    })



```
##### 编写插件代码



