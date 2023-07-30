// app.js

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
//const events = require('events')
const http = require('http')
const app = express();
const serverr = http.createServer(app);
const path = require('path');
const route = require('./routes/route');
const { json } = require('express/lib/response');
//const fs = require('fs')
const port = 3002;

const userSockets = {};
//fs.readFile('pathOfTheFile',(err,data) =>{console.log(data.toString());})

// Middleware for parsing JSON data
app.use(express.json());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Express session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static('public'));
app.use('/api', route);

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
       if (err) {
         console.error('Error connecting to the database:', err);
         return;
       }
       console.log('Connected to the database!');
});

// Middleware for authentication
const authenticateUser = (req, res, next) => {
    // Check if the user is logged in by checking if userId is present in the session
    if (req.session.userId) {
      next(); // User is authenticated, proceed to the next middleware or route handler
    } else {
      res.status(401).send('You need to log in first.');
    }
  };


  app.post('/api/register', async (req, res, next) => {
        try {
          const { username, password } = req.body;
      
          // Hash the password before storing it in the database
         const hashedPassword = await bcrypt.hash(password, 10);
      
          // Insert the user record into the database
          const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
          connection.query(query, [username, hashedPassword], (err, results) => {
            if (err) {
              console.error('Error registering user:', err);
              res.status(500).send('Error registering user.');
              return;
            }
      
            res.send('User registered successfully.');
          });
      
        } catch (error) {
          console.error('Error during registration:', error);
          res.status(500).send('Error during registration.');
        }
      });
      



// Route for user login
app.post('/api/login', async (req, res, next) => {
 
try {
    const { username, password } = req.body;
  
    // Fetch the user record from the database
    const query = 'SELECT * FROM user WHERE username = ?';
    connection.query(query, [username], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        res.status(500).send('Error fetching user.');
        return;
      }
  
      if (results.length === 0) {
        res.status(401).send('Invalid credentials.');
        return;
      }
  
      const user = results[0];
  
      // Ensure that the user.password is not null or undefined before comparing
      if (user.password == null) {
        res.status(401).send('Invalid credentials.');
        return;
      }
  
      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        res.status(401).send('Invalid credentials.');
        return;
      }
  
      // Store the user ID in the session to indicate that the user is logged in
      req.session.userId = user.id;
    
      io.emit('login', req.session.userId); //for notifying websocket
      res.send('Login successful.');
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error during login.');
  }
});

// Route for user logout
app.get('/api/logout', (req, res, next) => {
  // Destroy the session to log the user out
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).send('Error logging out.');
      return;
    }
    init();
    io.emit('logout', req.session.userId); //notifying websocket
    res.send('Logged out successfully.');
  });
});


// Protected route accessible only after authentication
app.get('/api/protected', authenticateUser, (req, res, next) => {
    res.send('Welcome to the protected page!');
  });


//Route for webSocket
app.get('/api/chat', authenticateUser, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
  });

  app.get('/api/users', authenticateUser, (req, res, next) => {
    connection.query('SELECT * FROM user', (error, result) =>{
            if(error){
                console.log('Error executing qury', error);
            }
            else{
               
                console.log('Query results:',result);
                res.json(result)
            }
        });

  });

  // app.delete('/api/deleteUser/:id', (req, res, next) => {
  //   connection.Remove({id: req.params.id}, function(err, result){
  //     if(err)
  //     {
  //       return res.json(err);
  //     }
  //     else{
  //       return res.json(result);
  //     }
  //   });
  // });

  


// Start the server
const init = function()
{
    connection.end((error) =>{
        if(error){
            console.log('Error closing connection', error);
          }
        else{
             console.log('My sql Connection closed');
         }
     })

}


// ... (your existing code)

// Start the server
const server = serverr.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  // WebSocket setup
  const io = require('socket.io')(server);
  
  // User socket mapping to store each user's socket
  io.on('connection', (socket) => {
    console.log('A client connected to the WebSocket server!');
  
    // Event when a user logs in and connects to the WebSocket
    socket.on('login', (userId) => {
      // Store the user's socket with their userId
      userSockets[userId] = socket;
    });
    

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Event when the sender sends a message to a recipient
  socket.on('sendMessage', ({ message, recipientUserId }) => {
    // Get the sender's userId from the socket
    const senderUserId = getUserIdFromSocket(socket);
    var recipientUserId = 6;

    // Check if the recipient is online (connected to the WebSocket)
    if (userSockets[recipientUserId]) {
      // Emit the message to the recipient's socket
      userSockets[recipientUserId].emit('message', message);
    } else {
      // Handle the case when the recipient is offline or not connected
      console.log(`Recipient with userId ${recipientUserId} is offline.`);
      // You can store the message in a database or send a notification, etc.
    }

    // You can also save the message in a database or perform other actions here.

    console.log(`Message sent from ${senderUserId} to ${recipientUserId}: ${message}`);
  });

  // Function to get the userId from the socket (assuming you have stored it in the session)
function getUserIdFromSocket(socket) {
  return socket.handshake.session.userId;
}

  // ...

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  
    // Event when a user logs out and disconnects from the WebSocket
    socket.on('logout', (userId) => {
      // Remove the user's socket when they log out
      delete userSockets[userId];
    });
  
    socket.on('disconnect', () => {
      console.log('A client disconnected from the WebSocket server.');
    });
  });
  
  // ... (your existing code)
  



//   const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//   });
  
//   // Test the connection
//   connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to the database:', err);
//       return;
//     }
//     console.log('Connected to the database!');
//   });
  
  
  
//   connection.query('SELECT * FROM persons', (error, result) =>{
//       if(error){
//           console.log('Error executing qury', error);
//       }
//       else{
         
//           console.log('Query results:',result);
//       }
//   });
//   //close the connection
//   connection.end((error) =>{
//       if(error){
//           console.log('Error closing connection', error);
//       }
//       else{
//           console.log('My sql Connection closed');
//       }
//   })

  








