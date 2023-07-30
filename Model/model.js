const mysql = require('mysql2');

const modelSchema = mysql.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }   
});

const chat = module.model('modelSchema', modelSchema)