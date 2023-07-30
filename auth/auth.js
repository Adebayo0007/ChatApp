const express = require('express');
// Middleware for authentication
const authenticateUser = (req, res, next) => {
    // Check if the user is logged in by checking if userId is present in the session
    if (req.session.userId) {
      next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
      res.status(401).send('You need to log in first.');
    }
  };

  module.exports = authenticateUser;