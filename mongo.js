const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://mostafatcan:${password}@mostapha-fso.vmfkvu6.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// create schema
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// set the schema to Person model
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    [, , , personName, personNumber] = process.argv

    const person = new Person({
        name: personName,
        number: personNumber,
    })

    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
} else if (process.argv.length === 3) {

    Person.find({}).then(result => {
        console.log('phonebook:');
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })

} else {
    console.log('number of command-line arguments cannot be ' + process.argv.length)
    process.exit(1)
}