const express = require('express');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { decode } = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

// middle ware 

app.use(express.json());
app.use(cors());

function verifyJWT(req,res,next){

    const authHeaders = req.headers.authorization;
    if(!authHeaders){
        return res.status(401).send({message: 'unauthorizes access'});
    }
    const token = authHeaders.split(' ')[1];
    jsonwebtoken.verify(token, process.env.ACCESS_TOKEN,(err,decoded)=>{
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        console.log('decoded',decoded);
        req.decoded = decoded;
    })
    console.log(authHeaders);
    next();
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghlbv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
    await client.connect();
    const productCollection = client.db("decibel").collection("product");
    app.get('/products', async(req,res)=>{

        const query = {}
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);

    });

    app.post('/products' ,async(req,res)=>{
        const addNewProduct = req.body;
        const result = await productCollection.insertOne(addNewProduct);
        res.send(result);
    })
    app.get('/products/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const product = await productCollection.findOne(query);
        res.send(product);
    })
    app.put('/products/:id',async(req,res)=>{
        const ids = req.body;
        const query = {_id:{$in:ids}};
        const product = await productCollection.find(query);
         res.send(product);
         console.log(product);
    });
    // delete 
    app.delete('/products/:id', async(req,res) =>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)}
         const result = await productCollection.deleteOne(query);
         res.send(result);
    })
    app.get('/myitems', verifyJWT ,async(req,res)=>{
       const decodedEmail = req.decoded.email
        const email = req.query.email;
        console.log(email);
         if(email === decodedEmail){
            const query = {email: email};
            const cursor = productCollection.find(query);
            const myitem = await cursor.toArray()
                    res.send(myitem);
         }
         else{
             res.status(403).send({message: 'Forbidden access'});
         }
        
    })

    //  auth api 
    app.post('/login',async(req,res)=>{
        const user = req.body;
        const accessToken = jsonwebtoken.sign(user,process.env.ACCESS_TOKEN,{
            expiresIn: '1d'
        });
        res.send({accessToken});

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