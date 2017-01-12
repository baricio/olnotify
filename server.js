var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();


var consulta = function() {
    var url = 'http://mg.olx.com.br/?q=moto+x';
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html)
            var dados = []
            $('#main-ad-list li.item').map(function(){
                var item = {}
                item.title = $(this).find('div.col-2 h3').text().replace(/(\n|\t)/g,'')
                item.locate = $(this).find('.OLXad-list-line-2 .detail-region').text().replace(/(\n|\t)/g,'')
                item.category = $(this).find('.OLXad-list-line-2 .detail-category').text().replace(/(\n|\t)/g,'')
                item.link = $(this).find('a.OLXad-list-link').attr('href')
                item.img = $(this).find('a.OLXad-list-link .image').data('original')
                dados.push(item);
            })
            console.log(dados)
        }
    })
    setTimeout(consulta,20000);
}
consulta();

//app.listen('8081')

//console.log('Magic happens on port 8081');

//exports = module.exports = app;
