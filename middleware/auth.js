const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const { returnSingleUserInfo } = require('../services/userServices');

// Protect Routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  if (!token) {
    console.log('No Token'.red);
    return next(new ErrorResponse('Unauthorized to access this route', '401'));
  }

  try {
    const decodedToken = jwt.decode(token, process.env.JWT_SECRET);

    const results = await returnSingleUserInfo(decodedToken.userID);
    req.userID = results.id;
    req.role = results.user_role;
    next();
  } catch (err) {
    console.log('Error while decoding token'.red);
    return next(new ErrorResponse('Unauthorized to access this route', '401'));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(new ErrorResponse(`User role '${req.role}' unauthorized to access this route`, '403'));
    }
    next();
  };
};
