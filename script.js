const { render } = require("ejs");
const express = require("express");
const app = express()
const path = require("path");
const collection = require("./src/mongodb")
const Bookcol = require("./src/mongobook")


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

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ username: req.body.username })

        if (check.password === req.body.password) {
            if (check.role === "admin") {

                res.render("home")
            }
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


