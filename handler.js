const serverless = require("serverless-http");
const express = require("express");
const httpProxy = require('http-proxy');
const httpProxyMiddleware = require('http-proxy-middleware');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use(cors()); // Enable CORS for the Express app

app.use((req, res, next) => {
  let target = req.url.slice(1); // Remove the leading slash
  if (!target) {
    return res.status(400).send('Target URL not provided.');
  }


  if (!target.startsWith("http://") && !target.startsWith("https://")) {
    // does it has 'http:/' or 'https:/'?
    const hasSlice = target.slice(0, 6) === 'http:/' || target.slice(0, 7) === 'https:/';
    if (hasSlice) {
      // replace 'http:/' or 'https:/' with 'http://' or 'https://'
      target = target.replace('http:/', 'http://').replace('https:/', 'https://');
    } else {
      return res.status(400).send(`Invalid target URL: ${target}. Include the protocol (http:// or https://).`);
    }
  }

  console.log(`Proxying request to ${target}`);

  // proxy.web(req, res, {
  //   target: target,
  //   changeOrigin: true, // Crucial for CORS
  //   secure: false, // If your target uses self-signed certificates, set to false.
  //   ws: false, // If your target is a WebSocket, set to true.
  //   ignorePath: true, // If your target expects a path, set to false.
  // }, (err) => {
  //   console.error("Proxy error:", err);
  //   res.status(500).send("Proxy error.");
  // });
  httpProxyMiddleware.createProxyMiddleware({
    target: target,
    changeOrigin: true, // Crucial for CORS
    secure: false, // If your target uses self-signed certificates, set to false.
    ws: false, // If your target is a WebSocket, set to true.
    ignorePath: true, // If your target expects a path, set to false.
  })(req, res, next);
});

exports.handler = serverless(app);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
})
