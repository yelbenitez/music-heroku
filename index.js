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
                                    
                    var req = unirest("GET", "https://api.spotify.com/v1/search?q=name:umbrella&type=album,track");

                    var song = bodyContent.queryResult.parameters["any"];
                    var artist = bodyContent.queryResult.parameters["music-artist"];
               //     var location = bodyContent.queryResult.parameters["any"];

                    req.header({'Content-Type':'application/json'});
                    req.header({'Authorization':'Bearer BQDBViucVsUIi3vKcrNb5Fp7FA6QNACwTdUJCG7_19i64uEi2O-CWdNbvcknvQCJhSyYjoLWO_fbLHFXP9HV1w47jHlUgV5MEOZd6abwWsVX7QyDZbdY3qzS2D3ZATcQbD9zvAqmmxECpOw3OX3LuiXP2FxEoRExFA'})
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
                        } else if(res.body.tracks.items.length > 0) {

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
                                              "textToSpeech": "Now playing : "
                                            }
                                          },
                                          {
                                            "basicCard": {
                                              "title": song, // song title
                                              "subtitle": "by : "+artist, // singer
                                             // "formattedText": "This is a basic card.  Text in a basic card can include \"quotes\" and\n            most other unicode characters including emoji 📱.  Basic cards also support\n            some markdown formatting like *emphasis* or _italics_, **strong** or\n            __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other\n            things like line  \nbreaks",
                                              "image": {
                                                "url": "https://firebasestorage.googleapis.com/v0/b/music-6643e.appspot.com/o/512.png?alt=media&token=9c463039-24c6-4947-8dcf-5a25d0628856",
                                                "accessibilityText": "Image alternate text"
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
                                  }
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