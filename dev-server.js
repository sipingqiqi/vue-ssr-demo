const path = require("path")
const express = require("express")
const webpack = require("webpack")
//使用前别忘了install
const webpackDevMiddleware = require("webpack-dev-middleware")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackConfig = require('./build/webpack.client.config.js')

webpackConfig.entry.app = ['webpack-hot-middleware/client', webpackConfig.entry.app]
webpackConfig.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin()
)

const app = express(),
            DIST_DIR = path.join(__dirname, "dist"),
            PORT = 9090,
            complier = webpack(webpackConfig)

console.log(webpackConfig.output.publicPath);

app.use(webpackDevMiddleware(complier, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
}))

app.use(webpackHotMiddleware(complier));

app.get("*", (req, res, next) =>{
  console.log(module.hot);
    const filename = path.join('./', 'index.html');

    complier.outputFileSystem.readFile(filename, (err, result) =>{
        if(err){
            return(next(err))
        }
        res.set('content-type', 'text/html')
        res.send(result)
        res.end()
    })
})

app.listen(PORT)

