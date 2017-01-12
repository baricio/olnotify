var express = require('express');
var fs = require('fs');
var request = require('request');
var iconv  = require('iconv-lite');
var cheerio = require('cheerio');
var app     = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);
var path = require('path');

var last_link;

var consulta = function(pesquisa, cb) {

    var url = 'http://mg.olx.com.br/'+ pesquisa.category +'?q=' + pesquisa.text.replace(/\s/g,'+');
    var requestOptions  = { encoding: null, method: "GET", uri: url};
    request(requestOptions, function(error, response, html){
        if(!error){
            var utf8String = iconv.decode(new Buffer(html), "ISO-8859-1");
            var $ = cheerio.load(utf8String)
            var dados = []
            $('#main-ad-list li.item').map(function(i){
                var item = {}
                item.title = $(this).find('div.col-2 h3').text().replace(/(\n|\t)/g,'')
                item.locate = $(this).find('.OLXad-list-line-2 .detail-region').text().replace(/(\n|\t)/g,'')
                item.category = $(this).find('.OLXad-list-line-2 .detail-category').text().replace(/(\n|\t)/g,'')
                item.link = $(this).find('a.OLXad-list-link').attr('href')
                item.img = $(this).find('a.OLXad-list-link .image').data('original')
                item.price = $(this).find('.OLXad-list-price').text().replace(/(\n|\t)/g,'')
                item.data = $(this).find('.col-4 p').first().text().replace(/(\n|\t)/g,'')
                item.hora = $(this).find('.col-4 p').last().text().replace(/(\n|\t)/g,'')

                if(typeof(item.price) !== 'undefined' && typeof(item.img) !== 'undefined'){
                    dados.push(item);
                }
            })
            cb(true,dados)
        }else{
            cb(false)
        }
    })
}

io.on('connection', function(socket) {
    socket.on('pesquisa', function(pesquisa) {
        consulta(pesquisa, function(success, data){
            if(success){
                io.emit('dados', data);
            }else{
                console.log('erro na pesquisa');
            }
        })
    });
});

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

server.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;
