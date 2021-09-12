var mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    phone: String,
    limit: Number,
    dateAdded: Date
},{timestamps: true})

const messages = mongoose.model('messages', messageSchema)

module.exports = messages