          //jshint esversion:6

          //REQUIRING THE DEPENDENCIES FOR THE PROJECT
          
          require("dotenv").config();
          const express = require("express");

          const  ejs = require("ejs");
    
          const bodyParser = require("body-parser");

          const mongoose = require("mongoose");
          const session = require("express-session")
          const passport = require("passport");
          const passportLocalMongoose = require("passport-local-mongoose");
          const GoogleStrategy = require("passport-google-oauth20").Strategy;
          const findOrCreate= require("mongoose-findorcreate");
          
         const app = express();

          app.use(bodyParser.urlencoded({ extended: true }));
          app.use(express.static("public"));

          app.set("view engine", "ejs");

          app.use(session({
            secret: "our little secret.",
            resave: false,
            saveUninitialized: false,
          }));

          //INITIALIZING PASPORT AND SETTING IT TO USE SESSION

          app.use(passport.initialize());
          app.use(passport.session());


          //SETTING THE DATABASE(MONGODB)

          const db_user = encodeURIComponent("alpha-admin");
          const db_pass = encodeURIComponent("test1234");

          const db_uri =
            "mongodb+srv://alpha-admin:test1234@cluster1995.hcn4h.mongodb.net/clientDB";
          // const db_uris = "mongodb+srv://" + db_user + ":" + db_pass + "@cluster0.e8tfq.mongodb.net/mindFeedDB";

          mongoose.connect(db_uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });


          //ALTERNATIVE TO SETTING THE DB

      
      //     var mongoDB = "mongodb://127.0.0.1/clientDB";
      //     mongoose.connect(
      //       "mongodb+srv://alpha-admin:test1234@cluster1995.hcn4h.mongodb.net/clientDB",
      //       { useNewUrlParser: true, useUnifiedTopology: true }
      //     );
          

      //     //Get the default connection
      //    var db = mongoose.connection;

      //  //Bind connection to error event (to get notification of connection errors)
      //     db.on('error', console.error.bind(console, 'MongoDB connection error:'));



      //SETTING THE MONGOOSE SCHEMA


          

          const clientSchema = new mongoose.Schema({ 
          firstname : String,
          lastname : String,
          username: String,
          email : String,
          password : String,
          googleId : String

          });

          console.log("SCHEMA OPTIONS:", clientSchema.options);

          clientSchema.plugin(passportLocalMongoose, { usernameUnique: false });
          clientSchema.plugin(findOrCreate);

          // MONGOOSE-ENCRYPTION
          // clientSchema.plugin(encrypt, {
          //   secret: process.env.SECRET,
          //   encryptedFields: ["password"],
          // });

          const Client = mongoose.model("Client", clientSchema);

          //SERIALIZING AND DESERIALIZING SESSION WITH PASSPORT

          passport.use(Client.createStrategy());

          passport.serializeUser(function (client, done) {
            done(null, client.id);
          });

          passport.deserializeUser(function (id, done) {
            Client.findById(id, function (err, client) {
              done(err, client);
            });
          });


          //ALTRERNATIVE TO SERIEALIZING AND DESERIALIZING WITH PASSPORT THIS HAS NULL PROPERTIES

          // passport.serializeUser(function (client, cb) {
          //   process.nextTick(function () {
          //     cb(null, {
          //       id: client.id,
          //       username: client.username,
          //       name: client.displayName,
          //     });
          //   });
          // });

          // passport.deserializeUser(function (client, cb) {
          //   process.nextTick(function () {
          //     return cb(null, client);
          //   });
          // });

          // passport.serializeUser(Client.serializeUser());
          // passport.deserializeUser(Client.deserializeUser());

          //USING THE PASSPORT GOOGLE STRATEGY

          passport.use(
            new GoogleStrategy(
              {
                clientID: process.env.GOOGLE_CLIENT_ID,

                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL:
                  "https://glacial-dawn-07822.herokuapp.com/auth/google/cyclepay",
                userProfileURL:
                "https://www.googleapis.com/oauth2/v3/clientinfo",
                
              },
              function (accessToken, refreshToken, profile, cb) {
                console.log(profile);
                Client.findOrCreate(
                  { googleId: profile.id, username:  profile.provider + profile.id },
                  function (err, client) {
                    return cb(err, client);
                  }
                );
              }
            )
          );

          




            

          app.get("/", function (req, res) {

          res.render("index");
          });

          app.get(
            "/auth/google",
            passport.authenticate("google", { scope: ["profile"] })
          );

          app.get(
            "/auth/google/cyclepay",
            passport.authenticate("google", { failureRedirect: "/login" }),
            function (req, res) {
              res.redirect("/dashboard");
            }
          );

          app.get(
            "/auth/google/cyclepay",

            passport.authenticate("google", {
              successRedirect: "/dashboard",
              scope: ["email", "profile"],
            })
          );

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

          app.get("/logout", function(req, res){
            res.redirect("/");
          })

          app.post("/logout", function(req, res){
                req.logout();
                res.redirect("/");
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

            const client = new Client({
              username: req.body.username,
              password: req.body.password
            });

            req.login(client, function(err){
              if(err) {
                console.log(err);
              } else {
                passport.authenticate("local")(req, res, function () {
                  res.redirect("/dashboard");
                });

              }
            })

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
 


          
           app.listen(process.env.PORT || 3000, function () {
             console.log("Server has started Successfully");
           });




          // app.listen(port, () => 
          // console.log("Server is successfully listening"));
