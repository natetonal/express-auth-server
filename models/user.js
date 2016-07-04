const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

// Schemas tell Mongoose about the particular fields we're going to have.
// Define our model:

// Schemas make literal references to the javascript object types.
// By setting unique to true, we tell mongoose to make sure that this field is unique.
// Since the unique test isn't case-sensitive, setting lowercase to true will make all strings equal.
const userSchema = new Schema({
    email: { type: String, unique: true, lowercase: true } ,
    password: String
});

// On save hook, encrypt password

// Before the model gets saved, run this function:
userSchema.pre('save', function(next) {

    // The context of this function is the user model - get access to the user model.
    const user = this;

    // Generate a "salt", then run callback
    bcrypt.genSalt(10, function(err, salt) {
        if(err){
            return next(err);
        }

        // Hash (encrypt) our password using the salt, then run another callback:
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if(err){
                return next(err);
            }

            // Overwrite plain text password with hashed password.
            user.password = hash;

            // Save the model.
            next();
        });
    });
});

// Whenever we create a user object, it will have access to any methods on this methods property:
userSchema.methods.comparePassword = function(candidatePassword, callback){
    // bcrypt comes with a helpful compare method that deals with hashing the incoming password & comparing for us. compare takes three arguments:
    // the candidate password (the password the user has posted),
    // the stored password (this.password, referring to this user's password prop, and
    // a callback that accepts an err & a boolean letting us know if they match.
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
        if(err) { return callback(err) }

        callback(null, isMatch);
    });
}

// Create model class:
// This adds this schema to the mongoose model class "user"
const ModelClass = mongoose.model('user', userSchema);

// Export the model:
module.exports = ModelClass;
