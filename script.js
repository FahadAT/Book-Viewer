const { render } = require("ejs");
const express = require("express");
const app = express()
const path = require("path");
const Usercol = require("./src/mongodb")
const Bookcol = require("./src/mongobook")
const multer  = require('multer')
const session = require('express-session');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

app.use(flash());
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
    res.render('login', { messages: req.flash('error') });
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
    
})
app.post("/add",upload.single('image'), async (req, res) => {
    const binfo = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        description: req.body.description,
        image: req.file.filename,
        createdby: req.session.user.username
    }
    await Bookcol.insertMany([binfo])
    console.log(req.file.filename)
    res.redirect('/books')
})
app.get("/users",(req,res)=>{
    Usercol.find({},(err,users)=>{
        if(err){
            console.error(err);
            res.status(500).send("Error retrieving users");
        }
        else{
            res.render("users", {users:users})
        }
    })
   
})
app.get("/books", (req, res) => {
    // Get the filter query parameter (if any)
    const filterType = req.query.filterType;
    const filterValue = req.query.filterValue;
  
    // Find all the books in the database
    Bookcol.find({}, (err, books) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving books");
      } else {
        // Check the user's role
        const isAdmin = req.session.user && req.session.user.role === "admin";
  
        // Filter the books by the selected filter type and value
        let filteredBooks = books;
        if (filterType && filterValue) {
          if (filterType === "publisher") {
            filteredBooks = filteredBooks.filter((book) => book.publisher === filterValue);
          } else if (filterType === "author") {
            filteredBooks = filteredBooks.filter((book) => book.author === filterValue);
          }
        }
  
        // Render the books page and pass the books data, isAdmin flag, and filter values
        if(req.session.user){
        res.render("Books", {
          books: filteredBooks,
          isAdmin: isAdmin,
          filterType: filterType,
          filterValue: filterValue,
        });
        }
    else{
        res.redirect('/login')
    }}
    });
  });

app.post("/login", async (req, res) => {
    try {
        const user = await Usercol.findOne({ username: req.body.username });

        if (!user) {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        }

        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        if (passwordMatch) {
            req.session.user = {
                username: user.username,
                role: user.role
            };
            res.redirect('/books');
        } else {
            req.flash("error", "Invalid username or password");
            return res.redirect("/login");
        }
    } catch (error) {
        console.log(error);
        req.flash('error', 'Server error');
        return res.redirect('/login');
    }
});
app.get("/update/:id", (req, res) => {


    Bookcol.findOne({ _id: req.params.id }, (err, book) => {
        if (err) return console.error(err);
        else
            res.render("edit", { book: book });

    });
});

app.post("/update",upload.single('image'), (req, res) => {


    let query = { _id: req.body.id }
    let binfo = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        description: req.body.description,
        image: req.file.filename
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
        res.send("Error: Unable to delete the book");
    }
});
app.get("/deleteu/:id", async (req, res) => {
    try {
        const id = req.params.id;
        await Usercol.deleteOne({ _id: id });
        res.redirect("/users");
    } catch (err) {
        console.error(err);
        res.send("Error: Unable to delete the book");
    }
});
app.post("/toadmin/:id", async (req, res) => {
    try {
      let query = { _id: req.params.id };
      await Usercol.updateOne(query, { $set: { role: "admin" } });
      res.redirect("/users"); // or redirect to a success page
    } catch (err) {
      console.error(err);
      res.redirect("/users"); // or redirect to an error page
    }
  });
app.post("/SignUp", async (req, res) => {
    const saltRounds = 10; // number of rounds used for the salt generation
    const plainPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  
    const data = {
      FirstName: req.body.FirstName,
      LastName: req.body.LastName,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    }
  
    try {
      await Usercol.insertMany([data]);
      req.session.user = {
        username: data.username,
        role: 'user'
      };
      res.redirect("/books");
    } catch (error) {
      console.log(error);
      req.flash('error', 'Error signing up');
      return res.redirect('/signup');
    }
  });
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
app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/login');
  });
app.listen(3000, () => {
    console.log("port connected");
})


