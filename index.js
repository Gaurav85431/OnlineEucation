const express = require('express');
const app = express();

const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/myLonexRentalProject');

const cors = require('cors');
const path = require('path');

app.use(cors());

//user routes
const user_route = require('./routes/userRoutes');

app.use('/api', user_route)


// app.listen(3000, function () {
//   console.log("Server is ready");
// })


const PORT = 8000;

const DB = "mongodb+srv://pushpamgaurav3:dLpqnrCXtPLA1Xt0@onlineeducation.ea3nu29.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB)
  .then(() => {
    console.log("Connected to MongoDB");
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server is running on :${PORT}`);
    });
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
  });


