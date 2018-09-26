const Vue = require('vue')
const path = require('path')
const express = require('express');
const server = express();
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer');
const bundle = require('./dist/vue-ssr-server-bundle.json');
const clientManifest = require('./dist/vue-ssr-client-manifest.json');

const resolve = file => path.resolve(__dirname, file)

const serve = (path, cache) => express.static(resolve(path))

server.use('/dist', serve('./dist', true))

server.get('*', (req, res) => {
  const context = { url: req.url, title: "我的主页" }

  const renderer = createBundleRenderer(bundle, {
    runInNewContext: false,
    clientManifest,
    template: fs.readFileSync('./index.html', 'utf-8')
  })

  renderer.renderToString(context, (err, html) => {
    if (err) {
      res.status(500).end(`Internal Server Error: ${err}`);
      return;
    }
    res.end(html);
  })
})

server.listen(8080)