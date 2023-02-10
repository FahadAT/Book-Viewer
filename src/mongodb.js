const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/booksite')
.then(()=>
{
    console.log("mdb connected")
})
.catch(()=>{
    console.log("failed")
})
const userSchema = new mongoose.Schema({
    FirstName:{
        type: String,
        required: true,
    },
    LastName:{
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    }
});
const Books = new mongoose.Schema({
    Author:{
        type: String,
        required: true,
    },
    BookName:{
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },

});
const collection=new mongoose.model("Collection1", userSchema)

module.exports=collection;