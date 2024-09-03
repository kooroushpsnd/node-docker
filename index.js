const express = require('express')
const app = express()
const postRouter = require('./routes/postRoutes')
const userRouter = require('./routes/userRoutes')
const cors = require("cors")
const session = require('express-session')

const mongoose = require('mongoose')
const { MONGO_IP, MONGO_PASSWORD, MONGO_USER, MONOG_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config')
const mongo_url = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONOG_PORT}/?authSource=admin`

const redis = require('redis')
const RedisStore = require("connect-redis").default
const redisClient = redis.createClient({url: `redis://${REDIS_URL}:${REDIS_PORT}`})

redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.log(err))


const connectWithRetry = () => {
    mongoose
        .connect(mongo_url ,{
            useNewUrlParser: true,
            useUnifiedTopology:true
        })
        .then(() => console.log("succesfully connected to DB"))
        .catch(e => {
            console.log(e)
            setTimeout(connectWithRetry, 5000);
        })
}

connectWithRetry()
app.use(express.json())
app.enable('trust proxy')
app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie : {
        secure : false,
        resave : false,
        saveUninitialized : false,
        httpOnly : true,
        maxAge : 60*1000
    }
}))

app.get('/api/v1' ,(req,res) => {
    res.send("<h2>hello Mate</h2>")
})

app.use("/api/v1/posts" ,postRouter)
app.use("/api/v1/users" ,userRouter)

const port = process.env.PORT || 3000

app.listen(port , () => console.log(`you are logged in on port ${port}`))