
const express = require("express");
const router = express.Router();
const User = require("./models/users");
const Admin = require("./models/admin");

router.get("/", (req, res) => {
    if (req.session.user) {
      res.render("user_home", { user: req.session.user, title: "User Welcome" });
    } else {
      res.render("login", { title: "Login Page" });
    }
  });

router.get("/admin", async (req, res) => {
  try {
    if (!req.session.admin) {
      return res.render("admin_login", { title: "Admin Login" });
    }

    const users = await User.find();
    const admin = await Admin.find();
    res.render("admin_panel", { title: "Admin Panel", users , admin});
  } catch (error) {
    res.json({ msg: error.message });
  }
});

router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
  
      if (!user) {
        return res.render("login", { msg: "Invalid Entry" });
      }
  
      if (user.password !== req.body.password) {
        return res.render("login", { msg: "Invalid Entry" });
      }
  
      req.session.user = user; // set the user object to the session
      res.redirect("/"); // redirect to the user home page
    } catch (error) {
      res.render("login", { msg: "Wrong Details" });
    }
  });
  

  router.post("/adminlogin", async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email });
  
      if (!admin) {
        return res.render("admin_login", { msg: "Invalid Entry" });
      }
  
      if (admin.password !== req.body.password) {
        return res.render("admin_login", { msg: "Invalid Entry" });
      }
  
      req.session.admin = admin; // set the user object to the session
      res.redirect("/admin"); // redirect to the user home page
    } catch (error) {
      res.render("admin_login", { msg: "Wrong Details" });
    }
  });

router.get("/userlogout", (req, res) => {
  req.session.user = null;
  res.render("login", { title: "Login Page", msg: "Logout Successfully" });
});

router.get("/adminlogout", (req, res) => {
  req.session.admin = null;
  res.render("admin_login", { title: "Admin Login", msg: "Logout Successfully" });
});

router.get("/signup.", (req, res) => {
    res.render("signup", { title: "Sign Up"});
  });


  router.get("/login.", (req, res) => {
    res.render("login", { title: "Login"});
  });


//insert an user to database roter from admin side
router.post('/add',(req,res)=>{
  if (req.session.admin) {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      
  });
  user.save().then(() => {
      req.session.message = {
          type: 'success',
          message: 'User added successfully!'
      };
      res.redirect('/admin');
  })
  .catch((err) => {
      res.json({message: err.message, type: 'danger'})
  });
  } else {
    res.render("admin_login", { title: "Login Page" });
  }
  
});


router.get('/add',(req,res)=>{
  if (req.session.admin) {
    res.render('add_users',{title : "Add Users"})
  } else {
    res.render("admin_login", { title: "Login Page" });
  }
  
})


//insert an user to database roter from home
router.post('/homeadd',async(req,res)=>{

  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        
    });
    user.save().then(() => {
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/');
    })
    .catch((err) => {
        res.json({msg: err.message, type: 'danger'})
    });
      
    }

  } catch (error) {
    // res.json({msg: err.message, type: 'danger'})
    res.render("signup", { title: "Sign Up", msg: "Email Already Exists" });
  }
 
});



//edit an user route
router.get('/edit/:id', (req,res)=>{
  
  if (req.session.admin) {
    let id=req.params.id;
    User.findById(id).exec()
        .then(user => {
            if(user == null){
                res.redirect('/admin')
            }
            else{
                res.render('edit_users',{
                    title: 'Edit User',
                    user: user
                })
            }
        })
        .catch(err => {
            res.redirect('/admin')
        });
  } else {
    res.render("admin_login", { title: "Login Page" });
  }
   
  });
  
  //update user route
  router.post('/update/:id', (req,res)=>{
    if (req.session.admin) {
      let id=req.params.id;
      User.findByIdAndUpdate(id, {
          name:req.body.name,
          email:req.body.email,
          password:req.body.password
    }).then(result => {
          req.session.message = {
              message: 'User updated successfully!',
              type: 'success'
          }
          res.redirect('/admin')
      }).catch(err => {
          res.json({message: err.message, type: 'danger'})
      });
    } else {
      res.render("admin_login", { title: "Login Page" });
    }
    
  });
  
  //delete user route 
  router.get('/delete/:id',(req, res)=>{
    if (req.session.admin) {
      let id=req.params.id
    User.findByIdAndDelete(id)
  .then(result => {
    req.session.message = {
      message: 'User deleted successfully!',
      type: 'info'
    }
    res.redirect('/admin')
  })
  .catch(err => {
    res.json({ message: err.message })
  });
  
    } else {
      res.render("admin_login", { title: "Login Page" });
    }
    
  });  

module.exports = router;
