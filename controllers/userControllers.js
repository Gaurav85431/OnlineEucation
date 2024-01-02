const user = require('../models/userModels');
const bcyptjs = require('bcryptjs');

const config = require('../config/config');


const jwt = require('jsonwebtoken');

// to validate the email
const validator = require("validator");

// to check the valid mobile number
const PhoneNumber = require("libphonenumber-js");


const nodemailer = require("nodemailer");

const randomstring = require("randomstring");


const create_token = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secret_jwt);
    return token;
  }
  catch (error) {
    res.status(400).send(error.message);
  }
}


const securePassword = async (password) => {

  try {
    const passwordHash = await bcyptjs.hash(password, 10);
    return passwordHash;
  }
  catch (error) {
    res.status(400).send(error.message);
  }

}


const register_user = async (req, res) => {

  try {

    const spassword = await securePassword(req.body.password);



    const users = new user({
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: spassword,
      confirmpassword: spassword,



    });
    // check for valid mail id
    const email = req.body.email;
    const isValidEmail = validator.isEmail(email);

    if (isValidEmail) {

      // check for valid mobile no.
      const mobileNumber = req.body.mobile;
      const parsedNumber = PhoneNumber.parse(mobileNumber, "IN"); // Here IN means Indian mobile no.
      const isPhoneNumber = PhoneNumber.isValidNumber(parsedNumber);
      if (isPhoneNumber) {
        //  check for password and confirm password
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        if (password === confirmpassword) {


          const userData = await user.findOne({ email: req.body.email });
          if (userData) {
            res.status(400).send({ success: false, msg: "This email is already exists" });
          }
          else {
            const user_data = await users.save();
            res.status(200).send({ success: true, msg: "Your have been successfully registered", data: { id: user_data._id, name: user_data.name, mobile: user_data.mobile, email: user_data.email } });
          }


        }
        else {
          res.status(400).send({ success: false, msg: "new and confirm password not matched" });
        }
      }
      else {
        res.status(400).send({ success: false, msg: "Insert Valid mobile number. Mobile number should be of 10 digits." });
      }
    }
    else {
      res.status(400).send({ success: false, msg: "Insert Valid email id" });
    }


  }
  catch (error) {

    res.status(400).send(error.message);
  }

}

// Log in method::::::

const user_login = async (req, res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;

    /* // It is not working using login
    const userData = await user.findOne({ email: email });
    const userMobile = await user.findOne({ mobile: mobile });


    if (userData || userMobile) {
      */

    const userData = await user.findOne({
      $or: [{ email: email }, { mobile: mobile }]
    });

    if (userData) {

      const passwordMatch = await bcyptjs.compare(password, userData.password);

      // userData.password is a hashing password

      if (passwordMatch) {

        const tokenData = await create_token(userData._id);

        const userResult = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,


          mobile: userData.mobile,

          token: tokenData
        }
        const response = {
          success: true,
          msg: "User Details",
          data: userResult
        }
        res.status(200).send(response);

      }
      else {
        res.status(200).send({ success: false, msg: "Login details are incorrect" });
      }
    }
    else {
      res.status(200).send({ success: false, msg: "Login details are incorrect" });
    }

  }
  catch (error) {
    res.status(400).send(error.message)
  }
}



/** To Reset or change password */

const resetpassword = async (req, res) => {
  try {


    const token = req.params.token;
    const tokenData = await user.findOne({ token: token });

    if (tokenData) {

      const password = req.body.password;

      const passwordmatch = await bcryptjs.compare(password, tokenData.password);
      if (passwordmatch) {
        const new_password = req.body.newpassword;
        const confirmpassword = req.body.confirmpassword;
        if (new_password === confirmpassword) {
          const newpassword = await securePassword(new_password);
          const userdata = await user.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newpassword } }, { new: true })

          res.status(200).send({ success: false, msg: "User password has been reset", data: userdata });
        }
        else {
          res.status(200).send({ success: false, msg: "newPassword and confirmPassword didn't match" });
        }

      }
      else {
        res.status(200).send({ success: false, msg: "password is wrong" });
      }
    }

    else {
      res.status(200).send({ success: false, msg: "invalid token" });
    }

  } catch (error) {
    res.status(400).send(error.message);
  }
}



const sendresetpasswordmail = async (username, email, token) => {

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    });

    const mailOption = {
      from: config.emailUser,
      to: email,
      subject: 'For reset password',
      // html: '<p> Hii ' + username + ', please click the link and <a href= "http://127.0.0.1:3000/api/resetpassword">  reset your password </a>'
      html: '<p> Hii ' + username + ', please click the link and <a href= "https://gauravlonexonlineeducation.onrender.com//api/resetpassword">  reset your password </a>'
    }

    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);

      }
      else {
        console.log("Mail has been sent : ", info.response);
      }
    });



  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}

const forget_password = async (req, res) => {

  try {
    const email = req.body.email;
    const userData = await user.findOne({ email: email });
    if (userData) {

      const Randomstring = randomstring.generate();
      const data = await user.updateOne({ email: email }, { $set: { token: Randomstring } });
      sendresetpasswordmail(userData.name, userData.email, Randomstring);
      res.status(200).send({ success: true, msg: "Please check your inbox of email and reset your password" })

    }
    else {

      res.status(200).send({ success: true, msg: "This email does not exist" });

    }

  } catch (error) {

    res.status(200).send({ success: false, msg: error.message });

  }

}





// this will open reset.ejs file on browser
const emailforgot = async (req, res) => {
  try {
    res.render('reset');
  } catch (error) {
    console.log(error.message);
  }
}

// Forget Password

const forgetuser = async (req, res) => {
  try {

    const email = req.body.email;

    const userdata = await user.findOne({ email: email })
    if (!userdata) {
      res.render('reset', { message: "This email doesn't exists" });
    }



    else {



      const newpassword = req.body.newpassword;
      const confirmpassword = req.body.confirmpassword;


      if (newpassword === confirmpassword) {


        const newpswd = await securePassword(newpassword);
        const userd = await user.findByIdAndUpdate({ _id: userdata._id }, { $set: { password: newpswd } }, { new: true })

        res.render('data', { message: " Your password has been changed successfully" });


      }


      else {

        res.render('reset', { message: " new password and confirm password did not match" });

      }

    }

  } catch (error) {
    res.render('reset', { message: error.message });


  }
}


//


module.exports = {
  register_user,
  user_login,
  forget_password,
  forgetuser,
  emailforgot,
  resetpassword

}