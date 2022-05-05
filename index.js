const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middle ware 

app.use(express.json());
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghlbv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
    await client.connect();
    const productCollection = client.db("decibel").collection("product");
    app.get('/product', async(req,res)=>{

        const query = {}
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);

    });

    app.post('/product' ,async(req,res)=>{
        const addNewProduct = req.body;
        const result = await productCollection.insertOne(addNewProduct);
        res.send(result);
    })

    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send("server site is running");
});
app.listen(port, ()=>{
    console.log("Assingment-11 server is running to port",port);

})