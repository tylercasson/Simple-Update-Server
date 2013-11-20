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

var http    = require('http'),
    version = require('./version'),
    express = require('express');

var port = 8000;

var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.logger());
  app.use(express.query());
  app.use(express.methodOverride());
});

/*
  Use this to check for the latest version.

  Example Response: { 'latestVersion': '2.0.2' }
 */
app.get('/latest', version.check);

/*
  If you are out of date, this will serve
  the latest version of your software.

  NOTE: The file name is available in the
  Response Content-disposition header:
  { 'content-disposition': 'attachment; filename="filename.type"' }
 */
app.get('/download', version.download);

/*
  After building a new version, upload it to
  this URI.
  POST data {
    "version": "your new version",
    "file": standard multipart file
  }
*/
app.post('/upload', version.upload);


var server = http.createServer(app).listen(port, function() {
  console.log('Download Server listening on port ' + port);
});
