const mongoose = require('mongoose')

if (process.argv.length !== 3 && process.argv.length !== 5 ) {
    console.log('add entry: node mongo.js <password> <name> <phoneNumber>')
    console.log('view entries: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://javier:${password}@cluster0.d4abljm.mongodb.net/Phonebook?retryWrites=true&w=majority`
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const name = process.argv[3]
    const phoneNumber = process.argv[4]

    mongoose
        .connect(url)
        .then((result) => {
            console.log('connected')

            const entry = new Person ({
                name: name,
                number: phoneNumber,
            })

            return entry.save()
        })
        .then(() => {
            console.log('note saved!')
            return mongoose.connection.close()
        })
        .catch((err) => {
            console.log(err)
            return mongoose.connection.close()
        })
} else if (process.argv.length === 3) {
    mongoose
        .connect(url)
        .then((result) => {
            console.log('connected')
            Person.find({}).then(result => {
                result.forEach(person => {
                    console.log(person)
                })
                mongoose.connection.close
            })
        })
}