//require('./bootstrap')
require('songbird')

let path = require('path')
let express = require('express')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let mongoose = require('mongoose')
let flash = require('connect-flash')
let requireDir = require("require-dir")

let passportMiddleware = require('./app/middlewares/passport')


const NODE_ENV = process.env.NODE_ENV || "development"

let app = express(),
    port = process.env.PORT || 8000

let CONFIG = requireDir("./config", {
  recurse: true
})

app.config = {
  auth: CONFIG.auth[NODE_ENV],
  database: CONFIG.database[NODE_ENV]
}

passportMiddleware.configure(app.config.auth)
app.passport = passportMiddleware.passport

//passportMiddleware.configure(CONFIG.auth['facebook'])
//app.passport = passportMiddleware.passport



console.log('value   :'+NODE_ENV);
// connect to the database
mongoose.connect(CONFIG.database['development'].url)

// set up our express middleware
app.use(morgan('dev')) // log every request to the console
app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
app.use(bodyParser.json()) // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs') // set up ejs for templating

// required for passport
app.use(session({
  secret: 'ilovethenodejs',
  resave: true,
  saveUninitialized: true
}))

// Setup passport authentication middleware
app.use(app.passport.initialize())
// persistent login sessions
app.use(app.passport.session())
// Flash messages stored in session
app.use(flash())


// configure routes
require('./app/routes')(app)

/**
 * Start Setup
 */
app.listen(port, ()=> console.log(`Listening @ http://127.0.0.1:${port}`))
