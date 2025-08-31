import { MongoClient , ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://user1:Abcd1234@cluster0.f9wy6s6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


export const client = new MongoClient(uri,{
    serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}) 