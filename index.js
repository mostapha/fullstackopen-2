require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')


const app = express()


morgan.token('post-body', req => req.method === "POST" ? JSON.stringify(req.body) : "")
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))


// allow requests from all origins
app.use(cors())

app.use(express.json())
app.use(express.static('build'))


let persons = []

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})


app.get('/info', (request, response) => {
    Person.find({}).then(people => {
        response.send(`
        <p>Phonebook has info for ${people.length} people</p>
        <p>${new Date()}</p>
        `)
    });
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    // check name
    if (!body.name || body.name.trim() === "") {
        return response.status(400).json({
            error: 'the name is not valid'
        })
    }

    // if (persons.some(p => p.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'the name must be unique'
    //     })
    // }

    if (!body.number || body.number.trim() === "") {
        return response.status(400).json({
            error: 'the number is not valid'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).end()
}
app.use(unknownEndpoint)


// Move the error handling of the application to a new error handler middleware.
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else {
        console.log('caught an error');
    }

    next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})