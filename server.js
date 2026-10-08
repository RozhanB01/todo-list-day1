const http = require("http");
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 3000;
const html = fs.readFileSync(path.join(__dirname, "index.html"));
http.createServer((req,res)=>{
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, {"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
    return res.end(html);
  }
  if (req.url === "/health") {
    res.writeHead(200, {"Content-Type":"application/json"});
    return res.end(JSON.stringify({ok:true,app:"Roznex AI Company OS"}));
  }
  res.writeHead(302,{Location:"/"});
  res.end();
}).listen(port, "0.0.0.0", ()=>console.log("Roznex AI Company OS listening on", port));
