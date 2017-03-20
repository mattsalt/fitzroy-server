const cluster = require('cluster')

if (cluster.isMaster) {
    const cpuCount = require('os').cpus().length
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork()
    }
	cluster.on('exit', function (worker) {
	    console.log('Worker %d with pid %d died' , worker.id, process.pid)
	    cluster.fork()
	})
} else {
    console.log('Worker %d running.', process.pid)
	const express = require('express')
	const fs = require('fs')
	const darwin = require('national-rail-darwin')
	const bodyParser = require('body-parser')
	const token = fs.readFileSync('./token.txt','UTF-8')
	const client = new darwin(token)  
	const app = express()

	var keys = fs.readFileSync('apikeys.txt').toString().split("\n")
	app.set('port', (process.env.PORT || 8081))
	app.use(bodyParser.json())
	app.listen(app.get('port'))


	app.get('/', function(req,res){
		res.send('Hello!')
	})

	app.use(function(req, res, next){
		console.log(req.headers)
		if (keys.indexOf(req.query.key) > -1 || 
		   (req.headers && req.headers.key && keys.indexOf(req.headers.key) > -1)){
			next()
		}else{
			res.status(400).send('unauthorised')
		}
	})

	app.get('/darwin/api/departures/*', function(req, res){
	   console.log('DEPARTURE BOARD')
	   const params = req.params
	   if(params){
	      const path = params[0]
	      const tokens = path.split('/')
	      if(tokens.length < 3){
	         res.status(500).send('Invalid Query Path - not enough parameters {3 expected}')
	      }else{
	         const fromStation = tokens[0].toUpperCase()
	         const filterType = tokens[1].toLowerCase()
	         const filterStation = tokens[2].toUpperCase()

	         client.getDepartureBoardWithDetails(fromStation, {filter:filterStation}, function(err, result){
	            if(err){
	                 res.status(500).send(err)
	            }else{
	                res.set('Content-Type', 'application/json')
	                res.send(JSON.stringify(result, null, 2))
	            }
	         })
	      }
	   }
	})

	app.get('/darwin/api/servicedetails/*', function(req, res){
	   console.log('SERVICE DETAILS')
	   var params = req.params
	   if(params){
	      const path = params[0]
	      const tokens = path.split('/')
	      if(tokens.length < 1){
	         res.status(500).send('Invalid query path - not enough paramaters {1 expected}')
	      }else{
	         console.log(params)
	         client.getServiceDetails(tokens[0], function(err, result){
	             res.set('Content-Type', 'application/json')
	             res.send(JSON.stringify(result, null, 2))
	         })
	      }
	   }
	})
}