// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/getScreenId

var port = process.env.PORT || 443;

var server = require('https'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

function serverHandler(request, response) {
    try {
        var uri = url.parse(request.url).pathname,
            filename = path.join(process.cwd(), uri);

        if (filename && filename.search(/server.js/g) !== -1) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        var stats;

        try {
            stats = fs.lstatSync(filename);
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            response.writeHead(404, {
                'Content-Type': 'text/html'
            });

            filename += '/finishqueensboulevard.html';
        }


        fs.readFile(filename, 'utf8', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'utf8');
            response.end();
        });
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('<h1>Unexpected error:</h1><br><br>' + e.stack || e.message || JSON.stringify(e));
        response.end();
    }
}

let options = {
  // Key and certificate for https, saved in root folder
  // key: fs.readFileSync('my-key.pem'),
  // cert: fs.readFileSync('my-cert.pem')
  // key: fs.readFileSync('/etc/letsencrypt/live/www.speakout.io/privkey.pem'),
  // cert: fs.readFileSync('/etc/letsencrypt/live/www.speakout.io/fullchain.pem')
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')

};

var app = server.createServer(options, serverHandler);

function runServer() {
    app = app.listen(port, process.env.IP || '0.0.0.0', function() {
        var addr = app.address();

        if (addr.address === '0.0.0.0') {
            addr.address = 'localhost';
        }

        console.log('Server listening at http://' + addr.address + ':' + addr.port);
    });
}

runServer();

//this second server runs on 80 and sends anyone to 443
// when adding express, need to install the package npm install express
var express = require('express')
var httpapp = express()

httpapp.get('/', function (req, res) {
  res.redirect('https://www.speakout.io/')
})

httpapp.get('/finishqueensboulevard', function (req, res) {
  res.redirect('https://www.speakout.io/finishqueensboulevard.html')
})

httpapp.get('/speak', function (req, res) {
  res.redirect('https://www.speakout.io/speak.html')
})

httpapp.listen(80, function () {
  console.log('I found someone asking for 80, send them to 443')
})
