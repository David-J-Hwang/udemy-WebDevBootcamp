const colors = require('colors')

const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const mongoose = require('mongoose')
const Campground = require('../models/campground')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => console.log('DATABASE CONNECTED!'.bgCyan))


const sample = array => array[Math.floor(Math.random() * array.length)]

// console.log(places[0])
// console.log(descriptors[0])

// console.log(sample(places))
// console.log(sample(descriptors))


const seedDB = async () => {
  // await Campground.deleteMany({})
  // const c = new Campground({title: 'purple field'})
  // await c.save()
  await Campground.deleteMany({})
  for(let i = 0; i < 50; i++){
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '658d3eec6d23c9bf443a94b4',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // image: `https://source.unsplash.com/collection/483251`,
      description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quas, excepturi magni nemo incidunt et ducimus optio corrupti consectetur expedita exercitationem laboriosam numquam nulla minus ex magnam! Ipsum sint quasi molestias?",
      price,
      images: [
        {
          url: 'https://res.cloudinary.com/dtktb8ap7/image/upload/v1704194725/YelpCamp/mdbjb20sn6ugldkrragg.jpg',
          filename: 'YelpCamp/mdbjb20sn6ugldkrragg',
        },
        {
          url: 'https://res.cloudinary.com/dtktb8ap7/image/upload/v1704194727/YelpCamp/u1wnltsm0pt66oo3wi1d.jpg',
          filename: 'YelpCamp/u1wnltsm0pt66oo3wi1d',
        },
        {
          url: 'https://res.cloudinary.com/dtktb8ap7/image/upload/v1704194728/YelpCamp/g5it7ntarlu8oropllee.jpg',
          filename: 'YelpCamp/g5it7ntarlu8oropllee',
        }
      ]
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})