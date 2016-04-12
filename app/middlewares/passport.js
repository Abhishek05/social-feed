let passport = require('passport')
let wrap = require('nodeifyit')
let User = require('../models/user')
let LocalStrategy = require('passport-local').Strategy
let FacebookStrategy = require("passport-facebook").Strategy
let TwitterStrategy = require("passport-twitter").Strategy
// Handlers
async function localAuthHandler(email, password) {
  console.log('I am here');
  let user = await User.promise.findOne({email})
  if (!user || email !== user.email) {
    return [false, {message: 'Invalid username'}]
  }

  if (!await user.validatePassword(password)) {
    return [false, {message: 'Invalid password'}]
  }


  return user
}

async function localSignupHandler(email, password) {
  email = (email || '').toLowerCase()
  // Is the email taken?
  if (await User.promise.findOne({email})) {
    return [false, {message: 'That email is already taken.'}]
  }

  // create the user
  let user = new User()
  user.email = email
  // Use a password hash instead of plain-text
  user.password = await user.generateHash(password)
  console.log('password is'+user.password);
  return await user.save()


}

// 3rd-party Auth Helper
function loadPassportStrategy(OauthStrategy, config, accountType) {
  config.passReqToCallback = true
  passport.use(new OauthStrategy(config, wrap(authCB, {spread: true})))

  async function authCB(req, token, _ignored_, account) {
       console.log('I am here')
    console.log('it is :'+JSON.stringify(accountType)+'::::'+account.id)




    let accountID = account.id
    let queryKey = accountType + ".id"
    let user
    if (req.user) {
      user = await User.promise.findById(req.user.id)
    } else {
      //if such user exist in database for facebook or twitter
      user = await User.promise.findOne({
        queryKey: accountID
      })

    }
    // console.log("><account", account)
    console.log("><req user", req.user)

    // try {
    //   user  = User.promise.find({
    //         accountID
    //     })
    // } catch (e) {
    //     console.log(">e", e)
    // }

    if (!user) {
      user = new User({})
    }
    user[accountType] = {
      id: accountID,
      token: token,
      secret: _ignored_,
      name: account.displayName
    }

    return await user.save()
      // 1. Load user from store by matching user[userField].id && account.id
      // 2. If req.user exists, we're authorizing (linking account to an existing user)
      // 2a. Ensure it's not already associated with another user
      // 2b. Link account
      // 3. If req.user !exist, we're authenticating (logging in an existing user)
      // 3a. If Step 1 failed (existing user for 3rd party account does not already exist), create a user and link this account (Otherwise, user is logging in).
      // 3c. Return user
  }
}

function configure(CONFIG) {
  // Required for session support / persistent login sessions
  passport.serializeUser(wrap(async (user) => user._id))
  passport.deserializeUser(wrap(async (id) => {
    return await User.promise.findById(id)
  }))

  console.log(CONFIG);

  /**
   * Local Auth
   */
  let localStrategy = new LocalStrategy({
    usernameField: 'email', // Use "email" instead of "username"
    failureFlash: true // Enable session-based error logging
  }, wrap(localAuthHandler, {spread: true}))

  let localSignupStrategy = new LocalStrategy({
    usernameField: 'email',
    failureFlash: true
  }, wrap(localSignupHandler, {spread: true}))

  loadPassportStrategy(FacebookStrategy, {
      clientID: CONFIG.facebook.consumerKey,
      clientSecret: CONFIG.facebook.consumerSecret,
      callbackURL: CONFIG.facebook.callbackUrl
    }, 'facebook')

  loadPassportStrategy(TwitterStrategy, {
    consumerKey: CONFIG.twitter.consumerKey,
    consumerSecret: CONFIG.twitter.consumerSecret,
    callbackURL: CONFIG.twitter.callbackUrl
  }, "twitter")

  passport.use('local-login', localStrategy)
  passport.use('local-signup', localSignupStrategy)


  /**
   * 3rd-Party Auth
   */

  // loadPassportStrategy(LinkedInStrategy, {...}, 'linkedin')
  // loadPassportStrategy(FacebookStrategy, {...}, 'facebook')
  // loadPassportStrategy(GoogleStrategy, {...}, 'google')
  // loadPassportStrategy(TwitterStrategy, {...}, 'twitter')

  return passport
}

module.exports = {passport, configure}
