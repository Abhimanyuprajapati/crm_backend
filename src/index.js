import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import authRoutes from './routes/auth.route.js';


const app = express()
const PORT = process.env.PORT || 1111;


app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
  res.send('Hello World to abhi!')
})

// auth routes
app.use('/v1/auth', authRoutes)

// app.post('/post', (req, res) => {
//   console.log(req.body);
//   res.send('successfully posted data')
// })


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
