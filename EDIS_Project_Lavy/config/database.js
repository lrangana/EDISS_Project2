// config/database.js
module.exports = {
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'lavanya',
  database : 'psptool'
});


connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});
};
