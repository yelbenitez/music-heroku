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
                                    
                    var req = unirest("GET", "http://api.openweathermap.org/data/2.5/weather");

                    var location = bodyContent.queryResult.parameters["any"];

                    req.query({
                        "q": location,
                        "appid": "7d0f75518b73948011a63cb53e385927"
                    });

                    req.send("{}");
                    req.end(function(res) {
                        if(res.body['cod']=='404') {
                            response.setHeader('Content-Type', 'application/json');
                            var pass = {
                                        fulfillmentText: 'Sorry, Please enter a specific area like city'
                                    }            
                            response.send(pass);
                        } else if(res.body.weather.length > 0) {

                            let result = res.body;
                            let weather = result.weather[0].description;
                            let temp_min = result.main['temp_min'] - 273.15;
                            let temp_max = result.main['temp_max'] - 273.15;
                            let wind = result.wind['speed'];
                            let clouds = result.clouds['all'];
                            let pressure = result.main['pressure'];
                            let output = "today in "+ location +": "+ weather + ", temperature from " + Math.round(temp_min)  +" Celsius to " + Math.round(temp_max) + " Celsius , wind " + wind + "m/s. clouds " + clouds + "% " + pressure+" hpa";

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
                                              "title": "Title: this is a title",
                                              "subtitle": "This is a subtitle",
                                              "formattedText": "This is a basic card.  Text in a basic card can include \"quotes\" and\n            most other unicode characters including emoji 📱.  Basic cards also support\n            some markdown formatting like *emphasis* or _italics_, **strong** or\n            __bold__, and ***bold itallic*** or ___strong emphasis___ as well as other\n            things like line  \nbreaks",
                                              "image": {
                                                "url": "https://example.com/image.png",
                                                "accessibilityText": "Image alternate text"
                                              },
                                              "buttons": [
                                                {
                                                  "title": "This is a button",
                                                  "openUrlAction": {
                                                    "url": "https://assistant.google.com/"
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