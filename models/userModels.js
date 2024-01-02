const mongoose = require('mongoose');

//  schema creation 

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  confirmpassword: {
    type: String,
    required: true
  },


});

// mongoose.model('User',userSchema);  // ab is file ko export kr denge

module.exports = mongoose.model('User', userSchema);