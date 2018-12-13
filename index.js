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
                if(bodyContent.queryResult.parameters["any"]){
                    
                    var song = bodyContent.queryResult.parameters["any"];
                    var artist = bodyContent.queryResult.parameters["artist"];
                    var req = unirest("GET", "https://api.spotify.com/v1/search?q=track:"+song+"%20"+artist+"&type=track&market=US");

                   
               //     var location = bodyContent.queryResult.parameters["any"];

                    req.header({'Content-Type':'application/json'});
                    req.header({'Authorization':'Bearer BQDKTClgZVqc5Skb8sbsuQ1Y2lTK-JYHwzeYyvUy6Wpf9VcX3opSQC6veOiMK_NCpaGe-WMrQR540Y-i2_OQqEKqonyTFvtwd7mkelmGiInstBMltgvqopsyRpDvKSL7IiffYmqbCJJHTV4aBCnqdFuZDgbErkLthg'})
                /*    req.query({
                        "q": "track:"+song+"%20"+artist,
                        "type": "track"
                    });*/

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
                                        fulfillmentText: 'Sorry, unable to find something about '+song+' and '+artist
                                    }            
                            response.send(pass);
                        }else if(res.body.tracks.items.length > 0) {

                           // let track = res.body.tracks.items[0];
                        //    let externalLink = track.album.artists[0].external_urls["spotify"];
                        //    let contentUrl = "";// track["preview_url"];
                           
                            for(let x = 0 ;x < res.body.tracks.items.length; x++){
                               
                                if(res.body.tracks.items[x]["preview_url"]!=null){

                                    let track = res.body.tracks.items[x];
                                    let contentUrl = track["preview_url"];
                                      // only preview
                                    let icon = track.album.images[0]["url"];
                                    let res_artist = track.album.artists[0]["name"];
                                    let album = track.album["name"];
                                    let track_name = track["name"];
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
                                                      "textToSpeech": "Now playing "
                                                    }
                                                  },
                                                  {
                                                    "mediaResponse": {
                                                      "mediaType": "AUDIO",
                                                      "mediaObjects": [
                                                        {
                                                          "contentUrl": contentUrl,
                                                          "description": "Artist : "+res_artist +"   Album : "+album,
                                                          "icon": {
                                                            "url": icon,
                                                            "accessibilityText": "Ocean view"
                                                          },
                                                          "name": track_name
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
                                                  "Found it! Your search preferrences: "+artist+" & "+song
                                                ]
                                              }
                                            }
                                          ]
                                    }

                                  response.send(pass); 
                                    break;
                                }
                            }
                            
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

//good lasttest dec 13, 2014