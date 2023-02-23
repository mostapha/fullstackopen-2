const express = require('express')
const morgan = require('morgan')
const cors = require('cors')


const app = express()


morgan.token('post-body', req => req.method === "POST" ? JSON.stringify(req.body) : "")
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))


// allow requests from all origins
app.use(cors())

app.use(express.json())
app.use(express.static('build'))


let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    response.json(persons)
})


app.get('/info', (request, response) => {
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
    `)
})


app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find(p => p.id === id);

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})


app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);

    persons = persons.filter(p => p.id !== id);

    response.status(204).end()
})


app.post('/api/persons', (request, response) => {
    const body = request.body

    // check name
    if (!body.name || body.name.trim() === "") {
        return response.status(400).json({
            error: 'the name is not valid'
        })
    }

    if (persons.some(p => p.name === body.name)) {
        return response.status(400).json({
            error: 'the name must be unique'
        })
    }

    if (!body.number || body.number.trim() === "") {
        return response.status(400).json({
            error: 'the number is not valid'
        })
    }


    const randomId = Math.floor(Math.random() * 1000000);

    const newPerson = {
        name: body.name,
        number: body.number,
        id: randomId
    }
    persons.push(newPerson);

    response.json(newPerson)
})


const unknownEndpoint = (request, response) => {
    response.status(404).end()
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})