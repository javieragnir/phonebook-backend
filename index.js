require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')

app.use(express.json())

morgan.token('body', function(req, res) {return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.use(express.static('build'))

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
	Person.find({}).then(people => {
		response.send(`<p>Phonebook has info for ${people.length} people</p> <p>${new Date()}</p>`)
	})
})

// Get all persons
app.get('/api/persons', (request, response) => {
	Person.find({}).then(people => {
		response.json(people)
	})
})

// Get individual person
app.get('/api/persons/:id', (request, response) => {
	Person.findById(request.params.id).then(person => {
		response.json(person)
	})
})

// Add person
app.post('/api/persons', (request, response, next) => {
	const body = request.body

	Person.find({ name: body.name }).then(result => {
		console.log('hello', result)
		console.log('test', result[0])
    
		if (result[0]) {
			return response.status(400).json({ error: 'cannot post, name already exists in phonebook' })
   
		} else {
			const person = new Person({
				name: body.name,
				number: body.number,
			})
    
			person.save()
				.then(savedPerson => {
					response.json(savedPerson)
				})
				.catch(error => next(error))
		}

	})
})

// Replace person entry
app.put('/api/persons/:id', (request, response, next) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(request.params.id, person, 
		{ new: true, runValidators: true, context: 'query' }
	)
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))
})

// Delete person
app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndRemove(request.params.id)
		.then(result => {
			response.status(204).end()
		})
		.catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)