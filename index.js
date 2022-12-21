const connectToMongo = require('./db')
const express = require('express')
var cors = require('cors')
connectToMongo();


const app = express()
const port = 5000
app.use(express.json())



app.use(cors())
// available routes
app.use(`/api/auth`, require('./Routes/auth'))
app.use(`/api/notes`, require('./Routes/notes'))

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)
})