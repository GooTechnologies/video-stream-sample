var fs = require("fs");
var http = require("http");
var path = require("path");
var connect = require('connect');
var serveStatic = require('serve-static');

var port = process.env.PORT || 8888;
var app = connect();

app.use(function(req, res, next){

  if (req.url.match(/^\/res\/[a-z\d]+.mp4$/)) {
    var file = path.resolve(__dirname, 'public', req.url.substr(1));
    var range = req.headers.range;

    fs.stat(file, function(err, stats) {
      var total = stats.size;

      if(range){
        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = (end - start) + 1;

        console.log(req.url, start, end);

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4"
        });
        fs.createReadStream(file, { start: start, end: end }).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        fs.createReadStream(file).pipe(res);
      }
    });
  } else {
    console.log(req.url + ' (static)');
    next();
  }
});

app.use(serveStatic(__dirname + '/public'));

http.createServer(app).listen(port);