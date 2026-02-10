import express from 'express';
import dotenv from 'dotenv';
dotenv.config();


const app = express()
const PORT = process.env.PORT || 1111;


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World to abhi!')
})


app.post('/post', (req, res) => {
    console.log(req.body);
  res.send('successfully posted data')
})


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
