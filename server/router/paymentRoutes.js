const express = require('express')
const router = express.Router()
const paymentController = require('../controller/paymentController')

const {getPayment}= paymentController
router.get('/',getPayment);
router.post('/make-payment',()=>{})

module.exports=router