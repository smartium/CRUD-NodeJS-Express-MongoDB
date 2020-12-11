const compression = require('compression')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express();
const PORT = process.env.PORT || 3000
var MONGO_URL = null
if (app.get('env') == 'development') {
	MONGO_URL = 'mongodb://localhost:27117'
}
else {
	MONGO_URL = 'mongodb://dbuser:dev1357@cluster0-shard-00-00.ftckb.mongodb.net:27017,cluster0-shard-00-01.ftckb.mongodb.net:27017,cluster0-shard-00-02.ftckb.mongodb.net:27017/quotes-app?ssl=true&replicaSet=atlas-13518p-shard-0&authSource=admin&retryWrites=true&w=majority'
}


// PROMISES
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
	.then(client => {
		console.log(`MongoDB connected @ ${client.s.url}`);
		const db = client.db('quotes-app')
		const Quotes = db.collection('quotes')

		app.use(compression())
		app.use(express.static(path.join(__dirname, 'public')))
		app.use(bodyParser.urlencoded({ extended: true }))

		app.listen(PORT, () => {
			console.log(`Server started @ port ${PORT} in ${app.get('env').toUpperCase()} mode`)
		})

		app.get('/', (req, res) => {
			res.sendFile(__dirname + '/public/index.html')
		})

		app.post('/quotes', (req, res) => {
			const object = req.body
			object.createdAt = new Date().valueOf()
			// object.sequence = Quotes.find().count()+1

			Quotes.insertOne(object)
				.then(result => {
					console.log(result.ops[0]);
					res.redirect('/')
				})
				.catch(error => console.error(error))
		})
	})
	.catch(error => console.error(error))

	app.get('/mode', (req, res) => {
		res.send(app.get('env'))
	})