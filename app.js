const compression = require('compression')
const express = require('express')
const path = require('path')
const http = require('http')
const reload = require('reload')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express();

const PORT = process.env.PORT || 3000
const MONGO_URL = app.get('env') == 'development' ? 'mongodb://localhost:27117' : process.env.MONGO_URL

//Sets our app to use the handlebars engine
app.set('view engine', 'hbs')

//Sets handlebars configurations (we will go through them later on)
app.engine('hbs', handlebars({
	layoutsDir: __dirname + '/views/layouts',
	partialsDir: __dirname + '/views/partials/',
	defaultLayout: 'default.hbs',
	extname: 'hbs'
}))

// USING PROMISES
MongoClient.connect(MONGO_URL, { useUnifiedTopology: true })
	.then(client => {
		console.log(`MongoDB connected @ ${client.s.url}`);
		const db = client.db('quotes-app')
		const Quotes = db.collection('quotes')


		app.use(compression())
		// app.use(express.static(path.join(__dirname, 'public')))
		app.use(express.static('public'))

		app.use(bodyParser.urlencoded({ extended: true }))


		

		// app.get('/', (req, res) => {
		// 	const cursor = db.collection('quotes').find().toArray()
		// 		.then(results => {
		// 			// console.log(results);
		// 		})
		// 	res.sendFile(__dirname + '/client/main.html')
		// })

		app.get('/', (req, res) => {
			const cursor = db.collection('quotes').find().toArray()
				.then(results => {
					res.render('main', {
						layout: 'index',
						quotes: results,
						listExists: true
					});
				})
		});

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

		// app.listen(PORT, () => {
		// 	console.log(`Server started @ port ${PORT} in ${app.get('env').toUpperCase()} mode`)
		// })

		const server = http.createServer(app)
		server.listen(PORT, () => {
			console.log(`Server started @ port ${PORT} in ${app.get('env').toUpperCase()} mode`)
		})
		reload(app)
	})
	.catch(error => console.error(error))

// GET ENVIRONMENT MODE
app.get('/mode', (req, res) => {
	res.send(`<h1>${app.get('env').toUpperCase()}</h1>`)
})