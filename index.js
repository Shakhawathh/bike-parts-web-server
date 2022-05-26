const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rlue6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {


    try {
        await client.connect()
        const serviceCollection = client.db('bike_parts').collection('services')
        const bookingCollection = client.db('bike_parts').collection('bookings')
        const userCollection = client.db('bike_parts').collection('users')




        app.put('/user/:email', async(req, res) =>{
            const email = req.params.email
            const user = req.body
            const filter={email:email}
            const options={upsert:true}
            const updateDoc ={
                $set:user,
            }
            const result = await userCollection.updateOne(filter,updateDoc,options)
            const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            res.send({result ,token})
        })

        app.get('/booking', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)
        })


        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        app.post('/booking', async (req, res) => {
            const booking = req.body
            const result = bookingCollection.insertOne(booking)
            res.send(result)
        })





    }
    finally {

    }

}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello bike-parts-server')
})

app.listen(port, () => {
    console.log(`bike APP listening on port ${port}`)
})