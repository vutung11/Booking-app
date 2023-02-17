const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const User = require('./models/User.js')
const { json } = require('express')

mongoose.set('strictQuery', true)

require('dotenv').config()
const app = express()

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'Newcode'

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173',
}))

mongoose.connect(process.env.MONGO_URL,
    // {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // })
    // .then(() => {
    //     console.log('Connect mongo successfully')
    // })
    // .catch((error) => {
    //     console.log('Connect fail', error.message)
    // }
)

app.get('/test', (req, res) => {
    res.json('test oke')
})

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    try {
        const user = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        })
        res.json(user)
    } catch (e) {
        res.status(400).json({
            message: e.message
        })
    }

})

app.post('/login', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user) {
        const passOk = bcrypt.compareSync(password, user.password)
        if (passOk) {
            jwt.sign({
                email: user.email,
                id: user._id,
                name: user.name,
            }, jwtSecret, {}, (error, token) => {
                if (error) throw error;
                res.cookie('token', token).json('passoke')
            })
        } else {
            res.status(422).json('password not working')
        }
    } else {
        res.json('not found')
    }
})

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (error, userData) => {
            if (error) throw error;
            const { name, email, _id } = await User.findById(userData.id)
            res.json({ name, email, _id })
        })

    } else {
        res.json('null')
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true)
})

app.listen(4000, console.log('Port 4000'))