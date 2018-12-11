'use strict';

var restify = require('restify');
const bodyParser = require('body-parser');
const http = require('https');
var unirest = require('unirest');
const {Card, Suggestion} = require('dialogflow-fulfillment');
var md = require('markdown');

var port = process.env.PORT || 8080;

var server = restify.createServer();

server.use(bodyParser.json());


try{
    server.post('/getMusic', function (request,response) {
        var bodyContent = request.body;
        var intent = bodyContent.queryResult.intent["displayName"];

        switch(intent){
            case 'Listen':
                if(bodyContent.queryResult.parameters["songs"]){
                                    
                    var req = unirest("GET", "https://api.spotify.com/v1/search");

                    var song = bodyContent.queryResult.parameters["songs"];
                    var artist = bodyContent.queryResult.parameters["artist"];
               //     var location = bodyContent.queryResult.parameters["any"];

                    req.header({'Content-Type':'application/json'});
                    req.header({'Authorization':'Bearer BQCWZhUN2zR7ri20H8W9MD-z6J5mdoFjbGKehmceFJ9mPyLEqO7w0_WeVcE-4EuO7yVkyqmr1J4uW7UhmNfpn9SLeC7wa1olzWIfGR0TuYD_lRP7_xYjXbTAmswWdEptjACJ15n0lXxd4jg3_KaX8Xlv_cMg3d4omA'})
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
                            let contentUrl = track["preview_url"]; // only preview
                            let icon = track.album.images[0]["url"];

                            response.setHeader('Content-Type', 'application/json', 'charset=utf-16');
                            var pass = {
                                "payload": {
                                    "google": {
                                      "expectUserResponse": true,
                                      "richResponse": {
                                        "items": [
                                          {
                                            "simpleResponse": {
                                              "textToSpeech": "Now playing : "
                                            }
                                          },
                                          {
                                            "mediaResponse": {
                                              "mediaType": "AUDIO",
                                              "mediaObjects": [
                                                {
                                                  "contentUrl": contentUrl,
                                                  "description": "",
                                                  "icon": {
                                                    "url": icon,
                                                    "accessibilityText": "Ocean view"
                                                  },
                                                  "name": song
                                                }
                                              ]
                                            }
                                          }
                                        ],
                                        "suggestions": [
                                          {
                                            "title": "Cancel"
                                          }
                                        ]
                                      }
                                    }
                                  },
                                  "fulfillmentMessages": [
                                    {
                                      "text": {
                                        "text": [
                                          "Found it!"
                                        ]
                                      }
                                    }
                                  ]
                            }
                        /*   
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
                                              "formattedText": "<b>Spotify</b> is a new digital music service that enables users to remotely source millions of different songs on various record labels from a laptop, smartphone or other device.",
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
                                  },"fulfillmentMessages": [
                                    {
                                      "text": {
                                        "text": [
                                          externalLink
                                        ]
                                      }
                                    }
                                  ]
                            }
   
*/

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