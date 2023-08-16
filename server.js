require('dotenv').config({ path: 'config/config.env' }); //Loading all configuration from env file
//Importing dependencies
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const isAuthenticated = require('./middlewares/auth');
const connectToDatabase = require('./config/database');
const app = express();
const port = process.env.PORT || 4000;

//Function to connect to the database 
connectToDatabase();

//CDN network setup

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLINT_NAME,
    api_key: process.env.CLOUDINARY_CLINT_API_KEY,
    api_secret: process.env.CLOUDINARY_CLINT_API_SECRET,
});

//MIDDLEWARES
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 }
}));
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Importing Routes
const user = require('./routes/User')
const post = require('./routes/Post')

//Using routes
app.use('/api/v1', user);
app.use('/api/v1', post);

//Just for testing
app.get('/', (req, res)=>{
res.status(200).json({
    success:true,
    message:"Server is working"
})
})

//Starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
