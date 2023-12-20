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

// ======================== Using mongoose ========================
const mongoose = require('mongoose')
const Campground = require('./models/campground')
mongoose.connect('mongodb://127.0.0.1/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))
// ================================================================

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

// ======================== Routes ========================
app.get('/', (req, res) => {
  res.render('campgrounds/home')
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => {
  // res.send(req.body)
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
  // res.send("IT WORKED!")
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true })
  res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
})

// ========================================================

// ======================== RUN SERVER ========================
app.listen(PORT, () => console.log(`SERVER LISTENING ON PORT: ${PORT}...`.bgCyan))
// ============================================================