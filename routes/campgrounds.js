const express = require('express')
const router = express.Router()

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Campground = require('../models/campground')

const { campgroundSchema, reviewSchema } = require('../schemas')

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

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
  if(error){
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}
// =========================================================================

// ======================== ROUTES ========================
router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
  res.render('campgrounds/new')
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
  // res.send(req.body)
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id).populate('reviews')
  // console.log(campground)
  res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
  // res.send("IT WORKED!")
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true })
  res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync( async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  res.redirect('/campgrounds')
}))
// ========================================================

module.exports = router;