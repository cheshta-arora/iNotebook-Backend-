const express = require('express');
const User = require('../Models/User');
const  router = express.Router() ; 
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');


const JWT_SECRET= 'cheshtaisagoodcitizen' ;

// ROUTE 1 : create a user using: POST "/api/auth/createuser" . Doesnt require auth 
router.post('/createuser', [
    body('name', "enter a valid name").isLength({min:3}), 
    body('email', "the email is incorrect").isEmail(), 
    body('password',"the password must have minimun 5 length").isLength({min:5})
] , async (req , res)=>{
//   console.log(req.body);
//   const user = User(req.body);
//   user.save();


// if there are errors, return bad request and the error
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}


try {
    // chehck whether the user exists already 
let user  = await User.findOne({email: req.body.email});
if(user){
    return res.status(400).json({error:" soory a user with email already exist"})
}
const salt = await bcrypt.genSalt(10);
const secPass =  await bcrypt.hash(req.body.password, salt);
user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: secPass,
  })
//   .then(user => res.json(user))
//   .catch(err=>{console.log(err)
//  res.json({error:'please enter a unique value',message: err.message})
// })
//   ;

//   res.send(req.body);
   const data = {
    user : {
        id:user.id
    }
   }
  const authToken = jwt.sign(data, JWT_SECRET); 

res.json({authToken});
// res.json(user)
} catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
}
})



//  ROUTE 2 : Autheticate  a user using: POST "/api/auth/login" . no login reqd 
router.post('/login',[
    body('email', 'enter a valid email').isEmail(), 
    body('password' , 'password cant be blaank').exists()
], async (req , res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const{email,password}= req.body ;
    try{
       let user = await User.findOne({email});
       if(!user){
        return res.status(400).json({error:"please try to login with correct credentials"});
       }

       const passwordComapre = await bcrypt.compare(password , user.password)
         if(!passwordComapre){
            return res.status(400).json({error:"please try to login with correct credentials"});
         }
   const data = {
    user:{
        id:user.id 
    }
   }
   
   const authToken = jwt.sign(data, JWT_SECRET);  
   res.json({authToken});

    }
    catch(error){
        console.log(error.message);
        res.status(500).send("internal server error");
    }
})


//  ROUTE 3 : get loggedin details using: POST "/api/auth/getuser" . login reqd 

router.post('/getuser', fetchuser , async (req , res)=>{
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
} catch (error) {
    console.log(error.message);
    res.status(500).send("internal server error");
}
})

module.exports = router 

