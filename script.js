const { render } = require("ejs");
const express = require("express");
const app = express()
const path = require("path");
const collection = require("./src/mongodb")
const Bookcol = require("./src/mongobook")
const multer  = require('multer')
const session = require('express-session');
const { check, validationResult } = require('express-validator/check')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.png')
    }
  })
  
  const upload = multer({ storage: storage })
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use('/public/', express.static('./public'));  // to load images
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
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
app.get("/add", (req, res) => {
    res.render("add")
    res.redirect('/books')
})
app.post("/add",upload.single('image'), async (req, res) => {
    const binfo = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        description: req.body.description,
        image: req.file.filename
    }
    await Bookcol.insertMany([binfo])
    console.log(req.file.filename)
    res.redirect('/books')
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
app.get("/update/:id", (req, res) => {


    Bookcol.findOne({ _id: req.params.id }, (err, book) => {
        if (err) return console.error(err);
        else
            res.render("edit", { book: book });

    });
});

app.post("/update", [
    check('title').isLength({ min: 5 }).withMessage('Title should be more than 5 char'),
    check('description').isLength({ min: 5 }).withMessage('Description should be more than 5 char'),
    check('location').isLength({ min: 3 }).withMessage('Location should be more than 5 char'),
    check('date').isLength({ min: 5 }).withMessage('Date should valid Date'),

], (req, res) => {


    let query = { _id: req.body.id }
    let binfo = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        description: req.body.description,
        image: req.body.image
    }
    Bookcol.updateOne(query, binfo, (err) => {
        if (err) return console.error(err);
        else {
            console.log("Book updated successfully!");
            res.redirect("/books");
        }
    });
});
app.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await Bookcol.deleteOne({ _id: id });
        res.redirect("/books");
    } catch (err) {
        console.error(err);
        res.send("Error: Unable to delete the mark");
    }
});
app.post("/SignUp", async (req, res) => {
    const data = {
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    await collection.insertMany([data])
    res.redirect("/")
})
app.get("/view/:id", (req, res) => {
    const id = req.params.id;
    Bookcol.findOne({_id : id}, (err, book) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error retrieving books");
        } else {
            // Check the user's role
            const isAdmin = req.session.user && req.session.user.role === "admin";
            // Render the books page and pass the books data and isAdmin flag
            res.render("view", { book: book, isAdmin: isAdmin });
        }
    });
});
app.listen(3000, () => {
    console.log("port connected");
})


