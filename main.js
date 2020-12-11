// https://devcenter.heroku.com/articles/getting-started-with-nodejs#push-local-changes

const compression = require('compression')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express();
const PORT = process.env.PORT || 3000
const MONGO_URL = app.get('env') == 'development' ? 'mongodb://localhost:27117' : process.env.MONGO_URL

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
			res.sendFile(__dirname + '/client/main.html')
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

	// GET ENVIRONMENT MODE
	app.get('/mode', (req, res) => {
		res.send(`<h1>${app.get('env').toUpperCase()}</h1>`)
	})