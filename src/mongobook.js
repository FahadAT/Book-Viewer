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
    }

});
const Bookcol=new mongoose.model("Collection2", Books)

module.exports=Bookcol;