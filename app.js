          require("dotenv").config();
          const express = require("express");

          const  ejs = require("ejs");
          const _ = require("lodash");

          const cors = require("cors");
          const path = require("path");
          var http = require("http");
          var fs = require("fs");
          var flash = require("connect-flash");




          const {
          body,
          validationResult,
          } = require("express-validator");
          const { Console } = require("console");
          const bodyParser = require("body-parser");

          const mongoose = require("mongoose");
          const session = require("express-session")
          const passport = require("passport");
          const passportLocalMongoose = require("passport-local-mongoose");
          



          const app = express();





          app.use(bodyParser.urlencoded({ extended: true }));
          app.use(express.static("public"));
          app.use(cors());
          app.use(bodyParser.json());

          app.set('trust proxy', 1) // trust first proxy
          app.use(flash());

          app.set("view engine", "ejs");

          app.use(session({
            secret: "our little secret.",
            resave: false,
            saveUninitialized: false,
          }));

          app.use(passport.initialize());
          app.use(passport.session());



          mongoose.connect(
          "mongodb+srv://alpha-admin:test1234@cluster1995.hcn4h.mongodb.net/clientDB",
          { useNewUrlParser: true }
          );

          

          const clientSchema = new mongoose.Schema({ 
          firstname : String,
          lastname : String,
          username: String,
          email : String,
          password : String

          });

          clientSchema.plugin(passportLocalMongoose);

          // MONGOOSE-ENCRYPTION
          // clientSchema.plugin(encrypt, {
          //   secret: process.env.SECRET,
          //   encryptedFields: ["password"],
          // });

          const Client = mongoose.model("Client", clientSchema);

          passport.use(Client.createStrategy());

          passport.serializeUser(Client.serializeUser());
          passport.deserializeUser(Client.deserializeUser());






          app.get("/", function (req, res) {

          res.render("index");
          });

          app.get("/about_us", function (req, res) {
          res.render("about_us");
          });

          app.get("/investment_plans", function (req, res) {
          res.render("investment_plans");
          });

          app.get("/our_services", function (req, res) {
          res.render("our_services");
          });

          app.get("/login", function (req, res) {
          res.render("login");
          });
          app.get("/policy", function (req, res) {
          res.render("policy");
          });

          

          app.get("/register", function (req, res) {
          res.render("register");
          });

          app.get("/dashboard", function (req, res) {
              if(req.isAuthenticated()) {
                res.render("dashboard");
              } else {
                res.redirect("/login");
              }
          });

          app.post("/register", function (req, res) {

            Client.register({username: req.body.username}, req.body.password, function(err, client){
                 if(err){
                  console.log(err);
                  res.redirect("/register");
                 } else {
                  passport.authenticate("local")(req, res, function(){
                    res.redirect("/dashboard");
                  })
                 }
            });






          });

          // SIGN-UP WITH BCRYPT
          // bcrypt.hash(
          // req.body.password,
          // saltRounds,
          // function (err, hash) {
          // const newClient = new Client({
          // firstname: req.body.firstname,
          // lastname: req.body.lastname,
          // username: req.body.username,
          // email: req.body.email,
          // password: hash,
          // });

          // newClient.save(function (err) {
          //   if (err) {
          //     console.log(err);
          //   } else {
          //     res.render("dashboard");
          //   }
          // });

          // }
          // );


          

          



          app.post("/login", function (req, res) {





          });

          // LOGIN WITH SALTING & HASHING(B-CRYPT)
      //     const username = req.body.username;
      //     const password = (req.body.password);

      //     Client.findOne({username: username}, function(err, foundClient) {
      //     if(err) {
      //     console.log(err);
      //     } else {
      //     if(foundClient){
      //       bcrypt.compare(password, foundClient.password, function (err, result) {
      //         if(result === true) {
      //            res.render("dashboard");

      //         }
              
      //       });
           
         
          
      //      }
      //   }
      // });
 


          let port = process.env.PORT;
          if (port == null || port == "") {
          port = 3000;
          }




          app.listen(port, () => 
          console.log("Server is successfully listening"));
