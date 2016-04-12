// config/auth.js
module.exports = {
  'development': {
    'facebook': {
            'consumerKey': '1772511919646971',
            'consumerSecret': '7c2aca4afe324bfbf4ac5ea3095f4329',
            'callbackUrl': 'http://socialauthenticator.com:8000/auth/facebook/callback'
        },
      'twitter': {
          'consumerKey': 'mYQmzJKkIaLi8lwcZ72UxA',
          'consumerSecret': '2ovsFyc8yWnM44Z1WRDX362SbCyjw1PYNb08JJrU',
          'callbackUrl': 'http://socialauthenticator.com:8000/auth/twitter/callback'
      },
      'google': {
          'consumerKey': '446585441765-unda5mjs6307q1pqobvhiqj87m9m2kh1.apps.googleusercontent.com',
          'consumerSecret': '...',
          'callbackUrl': 'http://socialauthenticator.com:8000/auth/google/callback'
      }
  }
}
