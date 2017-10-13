var express = require("express");
var path = require("path");
var app = express();
var rootpath = path.normalize(__dirname + "/qGen-app");
var port = process.env.PORT || 3001;

app.use(express.static(rootpath));
app.listen(3001, function(err) {
  if (err) console.error(err);
  console.log("server running on port 3001");
});
