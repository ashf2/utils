
const http = require('http')
const cp = require('child_process');
const chalk = require('chalk')

const port     = 10016
const hostname = 'localhost';
const browserSync = require('browser-sync').create();

// 检测端口是否被占用
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
