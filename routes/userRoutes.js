const express = require('express');
const user_routes = express();

const bodyParser = require('body-parser');
user_routes.use(bodyParser.json());
user_routes.use(bodyParser.urlencoded({ extended: true }));

user_routes.set('view engine', 'ejs');
user_routes.set('views', './views/users');

const user_controller = require('../controllers/userControllers');

const auth = require('../middleware/auth');

user_routes.post('/register', user_controller.register_user);

user_routes.post('/login', user_controller.user_login);

user_routes.post('/change-password/:token', auth, user_controller.resetpassword);

user_routes.get('/resetpassword', user_controller.emailforgot);

user_routes.post('/resetpassword', user_controller.forgetuser);

user_routes.post('/forgot-password', user_controller.forget_password);

user_routes.get('/test', auth, function (req, res) {
  res.status(200).send({ success: true, msg: "Authenticated" })

});

module.exports = user_routes;

