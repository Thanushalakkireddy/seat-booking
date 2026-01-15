const express = require("express")
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')

app.use(cors({
    origin: true,
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
const adminRouter = require('./router/adminRoute');
const userRouter = require('./router/userRoutes');
const paymentRouter = require('./router/paymentRoutes');
const {ConnectDB}= require('./utils/dbConnector');
const { startSeatCleanupJob } = require('./cron/seatCleanup');

ConnectDB();

// Start periodic cleanup of expired temporary bookings (Cron Job)
startSeatCleanupJob();

app.use('/payment',paymentRouter);
app.use('/api/admin',adminRouter);
app.use('/api/user',userRouter);
app.listen(process.env.PORT,()=>{
    console.log("App is running ");
   
})

//download and extract and open in vs code
//cd server 
//if node_modules exist / error occur delete no_modules folder 
//npm i
//npx prisma generate 
//npm run dev
