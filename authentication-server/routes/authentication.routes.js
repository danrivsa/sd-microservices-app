//main app router
const {Router} = require('express');
const app_router = Router();
const controller = require('../controllers/authentication.controller');
 
app_router.post('/authenticate',controller.Authenticate);

module.exports = app_router; 