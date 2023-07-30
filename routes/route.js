const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
//const sourceModule = require('./auth/auth');

//root router
router.get('/', async (req, res)=>{
    res.send('<h1>Welcome to my Chatting Server</h1>');
  });

//   // Route for user registration
// router.post('/registe', async (req, res) => {
//     try {
//       const { username, password } = req.body;
  
//       // Hash the password before storing it in the database
//      const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Insert the user record into the database
//       const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
//       connection.query(query, [username, hashedPassword], (err, results) => {
//         if (err) {
//           console.error('Error registering user:', err);
//           res.status(500).send('Error registering user.');
//           return;
//         }
  
//         res.send('User registered successfully.');
//       });
  
//     } catch (error) {
//       console.error('Error during registration:', error);
//       res.status(500).send('Error during registration.');
//     }
//   });
  
//   // Route for user login
//   router.post('/logi', async (req, res) => {
   
//   try {
//       const { username, password } = req.body;
    
//       // Fetch the user record from the database
//       const query = 'SELECT * FROM user WHERE username = ?';
//       connection.query(query, [username], async (err, results) => {
//         if (err) {
//           console.error('Error fetching user:', err);
//           res.status(500).send('Error fetching user.');
//           return;
//         }
    
//         if (results.length === 0) {
//           res.status(401).send('Invalid credentials.');
//           return;
//         }
    
//         const user = results[0];
    
//         // Ensure that the user.password is not null or undefined before comparing
//         if (user.password == null) {
//           res.status(401).send('Invalid credentials.');
//           return;
//         }
    
//         // Compare the provided password with the hashed password from the database
//         const passwordMatch = await bcrypt.compare(password, user.password);
    
//         if (!passwordMatch) {
//           res.status(401).send('Invalid credentials.');
//           return;
//         }
    
//         // Store the user ID in the session to indicate that the user is logged in
//         req.session.userId = user.id;
      
//         io.emit('login', req.session.userId); //for notifying websocket
//         res.send('Login successful.');
//       });
//     } catch (error) {
//       console.error('Error during login:', error);
//       res.status(500).send('Error during login.');
//     }
//   });
  
//   // Route for user logout
//   router.get('/logou', (req, res) => {
//     // Destroy the session to log the user out
//     req.session.destroy((err) => {
//       if (err) {
//         console.error('Error logging out:', err);
//         res.status(500).send('Error logging out.');
//         return;
//       }
//       init();
//       io.emit('logout', req.session.userId); //notifying websocket
//       res.send('Logged out successfully.');
//     });
//   });
  
  

  module.exports = router;