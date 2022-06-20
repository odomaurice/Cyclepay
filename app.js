
                    const express = require("express");
                    
                    const  ejs = require("ejs");
                    const _ = require("lodash");
                    
                    const mongoose = require("mongoose");
                    const encrypt = require("mongoose-encryption");
                    const bodyParser = require("body-parser");



                    const app = express();
                  

                    

                    app.set("view engine", "ejs");
                    app.use(bodyParser.urlencoded({ extended: true }));
                    app.use(express.static("public"));

                   

                    mongoose.connect("mongodb://localhost:27017/clientDB", { useNewUrlParser: true });

                    const clientSchema = new mongoose.Schema({ 
                        fName : String,
                        lName : String,
                        userName: String,
                        email : String,
                        password : String

                    });

                    const secret = "thisisoursecret";
                    clientSchema.plugin(encrypt, {
                      secret: secret,
                      encryptedFields: ["password"],
                    });

                    const Client = mongoose.model("Client", clientSchema);

                    

                  


                    app.get("/", function (req, res) {
                    
                        res.render("home");
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

                     app.get("/dashboard", function (req, res) {
                       res.render("dashboard");
                     });
                   
                    app.get("/sign_up", function (req, res) {
                      res.render("sign_up");
                    });

                    app.post("/sign_up", function (req, res) {
                        const newClient = new Client({
                        fName : req.body.fName,
                        lName : req.body.lName,
                        userName : req.body.userName,
                        email : req.body.email,
                        password : req.body.password,
                    });

                    newClient.save(function(err){
                        if(err){
                            console.log(err);
                        } else {
                            res.render("dashboard")
                        }
                    })
                        
                    });

                    

              app.post ("/login", function(req, res){
                const userName = req.body.userName;
                const password = req.body.password;

                Client.findOne({userName: userName}, function(err, foundClient) {
                  if(err) {
                    console.log(err);
                  } else {
                        if(foundClient){
                          if(foundClient.password === password) {
                            res.render("dashboard")
                          }
                      }
                    }
              });
          });





                    app.listen(3000, () => 
                        console.log("Server listening on port 3000"));
                    