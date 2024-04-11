const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String, 
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    }

})

//static signup method
userSchema.statics.signup = async function(username, email, password){
    if(!email || !password || !username){
        throw Error('All fields must be filled!!!')
    }
    if(!validator.isEmail(email)){
        throw Error('Email is not valid')
    }
    if(!validator.isStrongPassword(password)){
        throw Error('password not strong enough')
    }
    const emailExists = await this.findOne({email})
    if(emailExists){
        throw Error("email already in use!!!")
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({username, email, password: hash})

    return user
}

//static login method
userSchema.statics.login = async function(email, password){
    if(!email || !password){
        throw Error('All fields must be filled!!!')
    }
    const user = await this.findOne({email})
    if(!user){
        throw Error('Incorrect email!!!')
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        throw Error("Incorrect password!!!")
    }
    return {username: user.username, email: user.email, token: user.token}
}

module.exports = mongoose.model('User', userSchema)