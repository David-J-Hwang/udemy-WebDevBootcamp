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

if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
console.log(process.env.SECRET)
console.log(process.env.API_KEY)
// ==================================================================

// ======================== Express Server ========================
const express = require('express')
const app = express()
const PORT = 3000
// ================================================================

// ======================== Routers ========================
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
// =========================================================

// ======================== Using Custom Error Handler ========================
const ExpressError = require('./utils/ExpressError')
// ===========================================================================

// ======================== Using mongoose ========================
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const User = require('./models/user')
mongoose.connect('mongodb://127.0.0.1/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))
// ================================================================

// ======================== Sessions ========================
const session = require('express-session')
const flash = require('connect-flash')
// ==========================================================

// ======================== Passport ========================
const passport = require('passport')
const LocalStrategy = require('passport-local')
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

// passport.session() should be a latter part than using sessions
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})
// ================================================================

// ======================== Using Router ========================
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)
// ==============================================================

// ======================== Routes ========================
// app.get('/fakeUser', async (req, res) => {
//   const user = new User({ email: 'colt@gmail.com', username: 'colttt' })
//   const newUser = await User.register(user, 'chicken')
//   res.send(newUser)
// })



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
