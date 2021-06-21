const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yrjsh.mongodb.net/myFirstDatabase?retryWrites=true`;
const ObjectId = require("mongodb").ObjectId;
const bodyParser = require("body-parser").json();
const fileUpload = require("express-fileupload");
require('dotenv').config()
const app = express();
app.use(bodyParser);
app.use(cors());
app.use(express.static("doctors")); 
app.use(fileUpload());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = 5000;
client.connect((err) => {
  const appointmentCollection = client
    .db("DoctorPortal")
    .collection("Appointments");
  const doctorCollection = client.db("DoctorPortal").collection("Doctor");

  app.get("/", function (req, res) {
    res.send("Doctor Portal Server is Working");
  });

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/appointmentByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { date: date.date };
      // if(doctors.length === 0){
      //   filter.email = email;
      // }
      appointmentCollection.find(filter).toArray((err, documents) => {
        // console.log(email, date.date, doctors, documents)
        res.send(documents);
      });
    });
  });

  app.post("/addADoctor", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    console.log(file, name, email);
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    doctorCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/doctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // app.post('/isDoctor',(req, res) => {
  //   const email = req.body.email;
  //   doctorCollection.find({email: email})
  //   console.log(email)
  //   .toArray((err,doctors) =>{
  //     res.send(doctors.length > 0);
  //   })
  // })

});

app.listen(process.env.PORT || port);
