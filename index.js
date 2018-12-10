'use strict';

var restify = require('restify');
const bodyParser = require('body-parser');
const http = require('https');
var unirest = require('unirest');


var port = process.env.PORT || 8080;

var server = restify.createServer();

server.use(bodyParser.json());


try{
    server.post('/getMusic', function (request,response) {
        var bodyContent = request.body;
        var intent = bodyContent.queryResult.intent["displayName"];

        switch(intent){
            case 'Listen':
                if(bodyContent.queryResult.parameters["any"]){
                                    
                    var req = unirest("GET", "https://api.spotify.com/v1/search");

                    var song = bodyContent.queryResult.parameters["any"];
                    var artist = bodyContent.queryResult.parameters["music-artist"];
               //     var location = bodyContent.queryResult.parameters["any"];

                    req.header({'Content-Type':'application/json'});
                    req.header({'Authorization':'Bearer BQBRdnqHMNlPI7ofMrGyFoCv_35Qg9kiW_Yjc14C69vTTFkCP61zqzOGb-KLQN5rm-na7aRb0P0fzu7VtVSpSAX4bn7OAYpQNaHkaPjTBf81KNDKtCxtVOGiwOedx4q6Mr6H3weiHzAJs7_sD-_b1yfJATGZ2S5O2g'})
                    req.query({
                        "q": "name:"+song,
                        "type": "album,track"
                    });

               //     req.send("{}"); //error the body
                    console.log(req);
                    req.end(function(res) {
                        if(res.error) {
                            response.setHeader('Content-Type', 'application/json');
                            var pass = {
                                        fulfillmentText: 'Sorry, something went wrong'
                                    }            
                            response.send(pass);
                        }else if(res.body.tracks.items.length == 0){
                            response.setHeader('Content-Type', 'application/json');
                            var pass = {
                                        fulfillmentText: 'Sorry, unable to find something for your request. Please try again'
                                    }            
                            response.send(pass);
                        }else if(res.body.tracks.items.length > 0) {

                            let track = res.body.tracks.items[0];
                            let externalLink = track.album.artists[0].external_urls["spotify"];

                            response.setHeader('Content-Type', 'application/json', 'charset=utf-16');
                         
            
                            var pass = {
                                "payload": {
                                    "google": {
                                      "expectUserResponse": true,
                                      "richResponse": {
                                        "items": [
                                          {
                                            "simpleResponse": {
                                              "textToSpeech": "Found It! : "
                                            }
                                          },
                                          {
                                            "basicCard": {
                                              "title": song, // song title
                                              "subtitle": "preferred artist : "+artist, // singer
                                              "formattedText": "<b>Spotify<b> is a new digital music service that enables users to remotely source millions of different songs on various record labels from a laptop, smartphone or other device.",
                                              "image": {
                                                "url": "https://firebasestorage.googleapis.com/v0/b/music-6643e.appspot.com/o/512.png?alt=media&token=9c463039-24c6-4947-8dcf-5a25d0628856",
                                                "accessibilityText": "open.spotify.com"
                                              },
                                              "buttons": [
                                                {
                                                  "title": "Open", // open
                                                  "openUrlAction": {
                                                    "url": externalLink //url 
                                                  }
                                                }
                                              ],
                                              "imageDisplayOptions": "CROPPED"
                                            }
                                          }
                                        ]
                                      }
                                    }
                                  },
                                  "fulfillmentText": "found it! Here is the link : ",
                                  "url": externalLink
                            }
                               
                            response.send(pass); 
                        }
                    });

                  }      
                  break;
        }
    });

}catch(err){
    console.log(err);
}

server.get('/try', function (req,res){
    res.send('Hello world');
})

server.listen(port, function() {
   console.log('Now connected to PORT');
})