const { render } = require("ejs");
const express = require("express");
const app = express()
const path = require("path");
const collection = require("./src/mongodb")
const Bookcol = require("./src/mongobook")
const session = require('express-session');

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.set('views', path.join(__dirname, './views'))
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: false }))
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/signup", (req, res) => {
    res.render("SignUp")
})
app.get("/", (req, res) => {
    res.render("HomePage")
}
)
app.get("/add",(req,res)=>{
    res.render("add")
})
app.post("/add",async(req,res)=>{
    const binfo = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        description: req.body.description,
        image: req.body.image
    }
    await Bookcol.insertMany([binfo])
})
app.get("/books", (req, res) => {
    // Find all the books in the database
    Bookcol.find({}, (err, books) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving books");
      } else {
        // Check the user's role
        const isAdmin = req.session.user && req.session.user.role === "admin";
        // Render the books page and pass the books data and isAdmin flag
        res.render("Books", { books: books, isAdmin: isAdmin });
      }
    });
  });
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ username: req.body.username })

        if (check.password === req.body.password) {
            req.session.user = {
                username: check.username,
                role: check.role
            };
            res.redirect('/books')
        }
        else {
            res.send("wrong Password")
        }
    }
    catch {
        res.send("wrong details")
    }
})

app.post("/SignUp", async (req, res) => {
    const data = {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    await collection.insertMany([data])
})
app.listen(3000, () => {
    console.log("port connected");
})


