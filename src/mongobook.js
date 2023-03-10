const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/booksite')
.then(()=>
{
    console.log("mdb book connected")
})
.catch(()=>{
    console.log("failed")
})
const Books = new mongoose.Schema({
    author:{
        type: String,
        required: true,
    },
    publisher:{
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true
    },
    createdby:{
        type: String,
        required:true
    }
    
});
const Bookcol=new mongoose.model("Books", Books)

module.exports=Bookcol;