// ======================== MongoDB server command ========================
// - Open mongod: brew services start mongodb-community
// - Open mongosh: mongosh
// (127.0.0.1)
// MUST use url to this:
// https://source.unsplash.com/collection/483251
// Delete All Reviews: db.reviews.deleteMany({})
// ========================================================================

// ======================== External Modules ========================
const colors = require('colors')
// ==================================================================

// ======================== Express Server ========================
const express = require('express')
const app = express()
const PORT = 3000
// ================================================================

// ======================== Routers ========================
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
// =========================================================

// ======================== Using Custom Error Handler ========================
const ExpressError = require('./utils/ExpressError')
// ===========================================================================

// ======================== Using mongoose ========================
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
mongoose.connect('mongodb://127.0.0.1/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))
// ================================================================

// ======================== Sessions ========================
const session = require('express-session')
const flash = require('connect-flash')
// ==========================================================

// ======================== Using Joi ========================
// const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas')
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

// ======================== Using Public Assets ========================
app.use(express.static( path.join(__dirname, 'public') ))
// =====================================================================

// ======================== Using Sessions ========================
const sessionConfig = {
  secret: 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})
// ================================================================

// ======================== Using Router ========================
app.use("/campgrounds", campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
// ==============================================================

// ======================== Routes ========================
// Home Route
app.get('/', (req, res) => {
  res.render('campgrounds/home')
})

// Not existing routes
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

// POST /campgrounds/:id/reviews
