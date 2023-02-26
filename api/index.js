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
const BookingModel = require('./models/Booking.js')

mongoose.set('strictQuery', true)

const MONGO_URL = 'mongodb+srv://booking:Tung197@cluster0.jhjmij3.mongodb.net/Booking-App?retryWrites=true&w=majority'

require('dotenv').config()
const app = express()

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'Newcode'

app.use(express.json())
app.use(cookieParser())

app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(cors({
    credentials: true,
    origin: true,
}))

mongoose.connect(MONGO_URL,
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

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    });
}

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
            }, jwtSecret, {}, (error, token) => {
                if (error) throw error;
                res.cookie('token', token).json(user)
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
        maxGuest,
        price
    } = req.body

    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error;
        const places = await PlaceModel.create({
            owner: userData.id,
            title,
            address,
            photos: addPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuest,
            price,
        })
        res.json(places)
    })

})


app.get('/user-places', (req, res) => {
    const { token } = req.cookies
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        const { id } = userData
        res.json(await PlaceModel.find({ owner: id }))
    })
})

app.get('/places', (req, res) => {
    const { token } = req.cookies
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        res.json(await PlaceModel.find())
    })
})

app.get('/user-places/:id', async (req, res) => {
    const { id } = req.params
    res.json(await PlaceModel.findById(id))
})

app.put('/places', async (req, res) => {
    const { token } = req.cookies
    const {
        id,
        title,
        address,
        addPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuest,
        price
    } = req.body
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        const place = await PlaceModel.findById(id)
        if (userData.id === place.owner.toString()) {
            place.set({
                title,
                address,
                photos: addPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuest,
                price,
            })
            await place.save()
        }
        res.json('ok')

    })

})

app.get('/place/:id', async (req, res) => {
    const { id } = req.params
    res.json(await PlaceModel.findById(id))

})
app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const { place, checkIn, checkOut, name, phone, price } = req.body
    BookingModel.create({
        place, checkIn, checkOut, name, phone, price,
        user: userData.id
    }).then((doc) => {
        res.json(doc)
    }).catch((error) => {
        throw error;
    })
})

app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req)
    res.json(await BookingModel.find({ user: userData.id }).populate('place'))
})

app.listen(4000, console.log('Port 4000'))