/*
  Copyright (c) 2013 Tyler Casson. All rights reserved.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
 */

var libpath = require('path'),
    fs      = require('fs'),
    mime    = require('mime'),
    semver  = require('semver'),
    jf      = require('jsonfile');

var config = './config.json';

var version = jf.readFileSync(config)['latestVersion'];

// Wherever you want to store update files
var path = "./Files";

function writeConfig (key, value) {
  var existingConfig = jf.readFileSync(config);
  existingConfig[key] = value;
  jf.writeFileSync(config, existingConfig);
}

exports.check = function(req, res) {
  res.setHeader("Content-Type", "application/json");
  var json = { latestVersion: version };
  res.json(200, json);
};

exports.download = function(req, res) {

  var filename = libpath.join(path, version);

  try {
    stats = fs.lstatSync(filename); // throws if path doesn't exist
  } catch (e) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found\n');
    res.end();
    return;
  }

  if (stats.isFile()) {
    // path exists, is a file
    var mimeType = mime.lookup(filename);
    res.setHeader('Content-Type', mimeType);
    res.download(filename);
    return;
  } else if (stats.isDirectory()) {
    fs.readdir(filename, function(err, file) {
      filename = libpath.join(filename, file[0]);
      var mimeType = mime.lookup(filename);
      res.setHeader('Content-Type', mimeType);
      res.download(filename);
      return;
    });
  } else {
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.write('500 Internal server error\n');
    res.end();
  }
};

exports.upload = function(req, res) {
  if (semver.lte(req.body.version, version)) {
    var json = { success: false, status: "Error: Please specify a newer version.", latestVersion: version };
    res.setHeader('Content-Type', 'application/json');
    res.json(500, json);
    return;
  }
  var dirPath = libpath.join(path, req.body.version);
  var filePath = libpath.join(dirPath, req.files.file.name);
  console.log(dirPath);
  console.log(req.files.file.path);
  fs.readFile(req.files.file.path, function (err, data) {
    fs.exists(filePath, function (exists) {
      if (!exists) {
        fs.mkdirSync(dirPath);
        fs.writeFile(filePath, data, function (err) {
          if (!err) {
            version = req.body.version;
            writeConfig('latestVersion', version);
            var json = { success: true, latestVersion: version };
            res.json(200, json);
          } else {
            res.send(err);
          }
        });
        return;
      } else {
        console.log(filePath + " exists.");
        var json = { success: false, status: "That version already exists. Please specify a newer version.", latestVersion: version };
        res.json(500, json);
        return;
      }
    });
  });
};
