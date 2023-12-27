const express = require('express')
const router = express.Router({ mergeParams: true })

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Campground = require('../models/campground')
const Review = require('../models/review')

const { reviewSchema } = require('../schemas')

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

// Reviews Route
router.post('/', validateReview, catchAsync( async(req, res) => {
  // res.send('You made it!')
  const { id } = req.params
  const campground = await Campground.findById(id)
  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await review.save()
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync( async(req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }})
  await Review.findByIdAndDelete(reviewId)
  // res.send('Delete Me!')
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;