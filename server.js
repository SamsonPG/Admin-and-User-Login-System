const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const session = require("express-session");
const app = express();
const { v4: uuidv4 } = require("uuid");
const router = require("./router");
const nocache = require("nocache");
require('dotenv').config()
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({extended: false}))
app.use(express.json())


//database connection
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('Error connecting to user database:', error);
});
db.once('open', () => {
  console.log('Connected to the database');
});



//middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());

// Session middleware should be defined before the router middleware
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req,res,next)=>{
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

// Load static assets
app.use("/static", express.static(path.join(__dirname, "public")));


app.use("",require("./router"));

// Error route
app.use((req, res, next) => {
    res.render("error",{ title: 'Error Page' });
  });
  
  app.listen(PORT, () => {
    console.log(`Listening to the server on http://localhost:${PORT}`);
  });

