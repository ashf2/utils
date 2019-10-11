const http = require('http');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const net = require('net');
const md5 = require('md5');
const crypto = require('crypto');
const cp = require('child_process');

let preveMd5 = null;
let fsWait = false;
let websocketInstant = null;

let port = 10015;
// 默认端口，并检测端口是否被占用
portIsOccupied(port).then(() => {
  createServerFn()
  watchFile();
})

const createServerFn = () => {
  const server = http.createServer(function (req, res) {
    const filePath = path.join(process.cwd(), `/docs/${req.url}`);
    fs.stat(filePath, (err, stats) => { // fs.stat(path,callback),读取文件的状态；
      if (err) { // 说明这个文件不存在
        res.writeHead(404, {
          "Content-Type": "text/html"
        });
        res.end("<h1>404 Not Found</h1>");
        return;
      }
      if (stats.isFile()) { // 如果是文件
        if (filePath.includes('html')) {
          dealHtmlFile(filePath, res)
          return
        } else {
          let file = fs.createReadStream(filePath)
          file.pipe(res)
        }
      } else if (stats.isDirectory()) { // 如果是文件夹，拿到 index.html
        fs.readdir(filePath, function (err, files) {
          if (files.includes('index.html')) {
            dealHtmlFile(filePath + 'index.html', res)
          } else {
            res.end('<h1>404 no such file or directory</h1><p>no such file or directory</p><p>' + filePath + '/index.html</p>')
          }
        })
      }
    })
  });

  // 添加 socket
  createSocket(server);

  server.listen(port);
  console.log(`Server running on ${chalk.green(`http://localhost:${port}`)}`);
  cp.exec(`${process.platform === 'darwin' ? 'open' : 'start'} http://localhost:${port}/`);  // 自动打开默认浏览器
}

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

// html 文件添加 websocket
function dealHtmlFile(filepath, res) {
  let data = fs.readFileSync(filepath, 'utf-8')
  let scriptStr = `
    <script>
      let ws = new WebSocket("ws:"+location.host);
      let isClosed = false;
      ws.onopen = function(evt) {
        console.log('Connection open ...')
        setInterval(function(){
          if (!isClosed) {
            ws.send('check file modify...')
          }
        },1000)
      };
      ws.onmessage = function(evt) {
        const data = JSON.parse(evt.data);
        if (data.refresh && data.refresh == true) {
          location.reload()
        }
      }
      ws.onclose = function(evt) {
        console.log('Connection closed.')
        isClosed = true;
      }
      console.log(ws)
    </script>
  `
  data += scriptStr
  res.end(data)
}

function watchFile() {
  const filePath = './src/';
  console.log(chalk.green(`正在监听 ${filePath}`));
  fs.watch(filePath, { recursive: true }, (event, filename) => {
    if (filename) {
      if (fsWait) return;
      fsWait = setTimeout(() => {
        fsWait = false;
      }, 100)

      const currentMd5 = md5(fs.readFileSync(filePath + filename))
      if (currentMd5 == preveMd5) {
        return
      }
      preveMd5 = currentMd5
      console.log(`${filePath + filename} 发生更新`);
      console.log('更新 doc 文件中');
      cp.spawn(`yarn`, ['build:doc'], { cwd: process.cwd(), stdio: 'inherit' }, (err, stdout, stderr) => {
        if (err || stderr !== '\n') {
          console.warn('更新失败：', err, '\n', stderr);
          return;
        }
        console.log(chalk.green('更新完成'));
        // websocket 更新页面
        websocketInstant.write(encodeDataFrame({
          FIN: 1,
          Opcode: 1,
          MASK: 0,
          PayloadData: '{"refresh": ' + true + '}'
        }))
      });
    }
  })
}

function createSocket(server) {
  server.on('upgrade', (req, socket, head) => { // 在收到upgrade请求后，告知客户端允许切换协议
    const val = crypto.createHash('sha1')
      .update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
      .digest('base64');
    const frame = {
      buffer: Buffer.alloc(0),
    }
    socket.setNoDelay(true)
    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
      'Upgrade: WebSocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept:' + val + '\r\n' +
      '\r\n');
    websocketInstant = socket
    // 解码
    function decodeDataFrame(e) {
      let i = 0, j, arrs = [];
      let frame = {
        FIN: e[i] >> 7, // 右移7位等于1 e[0]转为二进制再右移
        Opcode: e[i++] & 15, //Opcode占第一个字节二进制后4位，和1111做与比较
        Mask: e[i] >> 7, // e[1]二进制第一位
        PayloadLength: e[i++] & 0x7F // e[1]二进制的后7位和(1111111) 做与运算
      };
      if (frame.PayloadLength === 126) {// 处理特殊长度126和127
        frame.PayloadLength = (e[i++] << 8) + e[i++]
      }
      if (frame.PayloadLength === 127) {
        i += 4; // 长度一般用4个字节的整型，前四个字节一般为长整型留空的。
        frame.PayloadLength = (e[i++] << 24) + (e[i++] << 16) + (e[i++] << 8) + e[i++]
      }
      if (frame.Mask) {
        frame.MaskingKey = [e[i++], e[i++], e[i++], e[i++]]
        for (j = 0, arrs = []; j < frame.PayloadLength; j++) {
          arrs.push(e[i + j] ^ frame.MaskingKey[j % 4])
        }
      } else {
        arrs = e.slice(i, i + frame.PayloadLength)
      }
      arrs = Buffer.from(arrs)
      if (frame.Opcode === 1) { // 是文本格式的
        arrs = arrs.toString()
      }
      frame.PayloadData = arrs
      return frame // 返回数据帧
    }
  });
}
// 编码算法
function encodeDataFrame(e) {
  let bufferArr = [];
  let PayloadData = Buffer.from(e.PayloadData) // 放到buffer
  const PayloadLength = PayloadData.length
  const fin = e.FIN << 7 // 转为2进制
  bufferArr.push(fin + e.Opcode) // 第一个字节拼好
  if (PayloadLength < 126) bufferArr.push(PayloadLength)
  else if (PayloadLength < 0x10000) bufferArr.push(126, (PayloadLength & 0xFF00) >> 8, PayloadLength & 0xFF)
  else bufferArr.push(
    127, 0, 0, 0, 0, //8字节数据，前4字节一般没用留空
    (PayloadLength & 0xFF000000) >> 24,
    (PayloadLength & 0xFF0000) >> 16,
    (PayloadLength & 0xFF00) >> 8,
    PayloadLength & 0xFF
  )
  return Buffer.concat([Buffer.from(bufferArr), PayloadData])
}
// 日期格式化
function dateFormat() {
  let date = new Date();
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  return year + '/' + month + '/' + day + ' ' + hours + ':' + minutes + ':' + seconds
}
