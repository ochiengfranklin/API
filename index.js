const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet')
const express = require('express');
const mongoose = require('mongoose')
const authRouter = require('./routers/authRouter.js')

const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded( {extended:true}) )
app.get('/', (req, res) => {
    res.json({message: "Hello there"})
})

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Database connected");
    
}).catch((err) => {
    console.log(err);
    
});
app.use('/api/auth', authRouter);

app.listen(process.env.PORT, () => {
    console.log(`listening...`);
    
})
