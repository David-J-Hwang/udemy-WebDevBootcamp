// ======================== MongoDB server command ========================
// - Open mongod: brew services start mongodb-community
// - Open mongosh: mongosh
// (127.0.0.1)
// MUST use url to this:
// https://source.unsplash.com/collection/483251
// ========================================================================

// ======================== External Modules ========================
const colors = require('colors')
// ==================================================================

// ======================== Express Server ========================
const express = require('express')
const app = express()
const PORT = 3000
// ================================================================

// ======================== Using Custom Error Handler ========================
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
// ===========================================================================

// ======================== Using mongoose ========================
const mongoose = require('mongoose')
const Campground = require('./models/campground')
mongoose.connect('mongodb://127.0.0.1/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))
// ================================================================

// ======================== Using Joi ========================
// const Joi = require('joi')
const { campgroundSchema } = require('./schemas')
// ===========================================================

// ======================== Using ejs ========================
const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
// ===========================================================

// ======================== Using ejs-mate ========================
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate)
// ================================================================

// ======================== Using method-override ========================
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
// =======================================================================

// ======================== Using body-parser ========================
app.use(express.urlencoded({ extended: true }))
// ===================================================================

// ======================== Using Custom Middleware ========================
// if(!req.body.campground) throw new ExpressError('Invalid campground data', 400)
// not a mongoose schema, validate before storing data into mongoose
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
    // console.log(result)
}
// =========================================================================

// ======================== Routes ========================
app.get('/', (req, res) => {
  res.render('campgrounds/home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
  // res.send(req.body)
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  // res.send("IT WORKED!")
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true })
  res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync( async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
}))

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})
// ========================================================

// ======================== ERROR HANDLER ========================
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if(!err.message) err.message = 'Something went wrong!'
  res.status(statusCode).render('error', {err})
  // res.send('Oh Boy, something went wrong!')
})
// ===============================================================

// ======================== RUN SERVER ========================
app.listen(PORT, () => console.log(`SERVER LISTENING ON PORT: ${PORT}...`.bgCyan))
// ============================================================