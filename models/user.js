var mongoose = require('mongoose');
  Schema = mongoose.Schema;
  bcrypt = require('bcrypt');
  SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
},{collection: 'userInfo'});

UserSchema.pre('save', function(next, done) {
  var user = this;
  //save only if the user does not exists
  mongoose.models['User'].findOne({ username: user.username }, function(err, user2) {
      if(err) done(err);
      //username already exists
      else if(user2){
        user.invalidate("username","username already exists");
        return done(new Error('Username must be unique'));
      }
      else{
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return done();
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
          if (err) return done(err);
          // hash the password using our new salt
          bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return done(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
          });
        });
      }
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);

