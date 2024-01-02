const colors = require('colors')
const express = require('express')
const router = express.Router()

const campgrounds = require('../controllers/campgrounds')

const catchAsync = require('../utils/catchAsync')

const Campground = require('../models/campground')

const { campgroundSchema, reviewSchema } = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


const multer = require('multer')
const { storage } = require('../cloudinary')
// const upload = multer({ dest: 'uploads/ '})
const upload = multer({ storage })


// ======================== ROUTES ========================
router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
  // .post(upload.array('image'), (req, res) => {
  //   console.log(req.body, req.files)
  //   res.send('It Worked!')
  // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


// router.get('/', catchAsync(campgrounds.index))

// router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// router.get('/:id', catchAsync(campgrounds.showCampground))

// router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))
// ========================================================

module.exports = router;