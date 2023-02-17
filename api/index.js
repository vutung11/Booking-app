const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const imageDownloader = require('image-downloader')
const multer = require('multer')
const fs = require('fs')
const User = require('./models/User.js')
const { json } = require('express')
const PlaceModel = require('./models/Place.js')

mongoose.set('strictQuery', true)

require('dotenv').config()
const app = express()

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'Newcode'

app.use(express.json())
app.use(cookieParser())

app.use('/uploads', express.static(__dirname + '/uploads'))
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

app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body
    const newName = 'photo' + Date.now() + '.jpg'
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    })
    res.json(newName)
})

const photosMiddleware = multer({ dest: 'uploads' })
app.post('/upload', photosMiddleware.array('photos', 100), (req, res) => {
    const uploadedFiles = []
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i]
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath)
        uploadedFiles.push(newPath.replace('uploads', ''))
    }
    res.json(uploadedFiles)
})

app.post('/places', async (req, res) => {
    const { token } = req.cookies
    const {
        title,
        address,
        addPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuest
    } = req.body

    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error;
        const places = await PlaceModel.create({
            title,
            address,
            addPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuest
        })
        res.json(places)
    })

})

app.listen(4000, console.log('Port 4000'))