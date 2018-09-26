const Vue = require('vue')
const express = require('express')
const path = require('path')
const LRU = require('lru-cache')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')
const fs = require('fs')
const net = require('net')
const http = require('http');
const compression = require('compression');


const template = fs.readFileSync('./templates/index.html', 'utf-8')
//const isProd = process.env.NODE_ENV === 'production'
const isProd = false;

const server = express()

function createRenderer (bundle, options) {
  return createBundleRenderer(bundle, Object.assign(options, {
    template: template,
    basedir: resolve('./dist'),
    runInNewContext: false
  }))
}

let renderer;

let readyPromise

readyPromise = require('./build/setup-dev-server')(server, (bundle, options) => {
  renderer = createRenderer(bundle, options)
})

server.get('*', (req, res) => {
  const context = {
    title: '我的主页',
    url: req.url
  }
  renderer.renderToString(context, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error:' + err)
      return
    }
    res.end(html)
  })
})

function probe(port, callback) {
    let servers = net.createServer().listen(port)
    let calledOnce = false
    let timeoutRef = setTimeout(function() {
        calledOnce = true
        callback(false, port)
    }, 2000)
    timeoutRef.unref()
    let connected = false

    servers.on('listening', function() {
        clearTimeout(timeoutRef)
        if (servers)
            servers.close()
        if (!calledOnce) {
            calledOnce = true
            callback(true, port)
        }
    })

    servers.on('error', function(err) {
        clearTimeout(timeoutRef)
        let result = true
        if (err.code === 'EADDRINUSE')
            result = false
        if (!calledOnce) {
            calledOnce = true
            callback(result, port)
        }
    })
}
const checkPortPromise = new Promise((resolve) => {
    (function serverport(_port = 6180) {
        // let pt = _port || 8080;
        let pt = _port;
        probe(pt, function(bl, _pt) {
            // 端口被占用 bl 返回false
            // _pt：传入的端口号
            if (bl === true) {
                // console.log("\n  Static file server running at" + "\n\n=> http://localhost:" + _pt + '\n');
                resolve(_pt);
            } else {
                serverport(_pt + 1)
            }
        })
    })()

})
checkPortPromise.then(data => {
    uri = 'http://localhost:' + data;
    console.log('启动服务路径'+uri)
    server.listen(data);
});
