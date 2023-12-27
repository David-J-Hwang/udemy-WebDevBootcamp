const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
})

// Adding username and password in schema
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)