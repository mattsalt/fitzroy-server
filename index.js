var express = require('express')
var fs = require('fs')
var darwin = require('national-rail-darwin')
var bodyParser = require('body-parser')

var token = fs.readFileSync('./token.txt','UTF-8')
console.log('token')

var client = new darwin(token)  
var app = express()
app.set('port', (process.env.PORT || 8081));
app.use(bodyParser.json());
app.listen(app.get('port'));


app.get('/', function(req,res){
	res.send('Hello!')
})

app.get('/darwin/api/departures/*', function(req, res){
   console.log('DEPARTURE BOARD')
   var params = req.params
   if(params){
      var path = params[0]
      var tokens = path.split('/')
      if(tokens.length < 3){
         res.status(500).send('Invalid Query Path - not enough parameters {3 expected}')
      }else{
         var fromStation = tokens[0].toUpperCase()
         var filterType = tokens[1].toLowerCase()
         var filterStation = tokens[2].toUpperCase()

         client.getDepartureBoardWithDetails(fromStation, {filter:filterStation}, function(err, result){
            if(err){
                 res.status(500).send(err)
            }else{
                res.set('Content-Type', 'application/json');
                res.send(JSON.stringify(result, null, 2))
            }
         })
      }
   }
})

app.get('/darwin/api/servicedetails/*', function(req, res){
   console.log('SERVICE DETAILS')
   var params = req.params;
   if(params){
      var path = params[0]
      var tokens = path.split('/')
      if(tokens.length < 1){
         res.status(500).send('Invalid query path - not enough paramaters {1 expected}')
      }else{
         console.log(params)
         client.getServiceDetails(tokens[0], function(err, result){
             res.set('Content-Type', 'application/json');
             res.send(JSON.stringify(result, null, 2))
         })
      }
   }
})