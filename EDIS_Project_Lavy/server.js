// server.js  //upload //lavy
//edit

// setting up & getting all the tools we need
var express  = require('express');
var app      = express();
var session      = require('express-session');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');


//var port     = process.env.PORT || 8080;
var port     = process.env.PORT || 6000;


//redis variable
var redis = require("redis");
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379, 'redis-v2.gtjqw1.0001.use1.cache.amazonaws.com', {no_ready_check: true});


//MYSQL DB CONFIG

/*var connection = mysql.createConnection({
  host     : 'lavymysql.cnywgp1kyedu.us-east-1.rds.amazonaws.com',
  port	   : '3306',
  user     : 'root',
  password : 'lavanyar',
  database : 'Project1_DB'
});
*/

var connection = mysql.createConnection({
  //host: 'localhost',
  host     : 'lavymysql.cnywgp1kyedu.us-east-1.rds.amazonaws.com',
  port	   : '3306',
  user     : 'root',
  //password: 'lavanya', //local
  password : 'lavanyar',
  //database: 'edis',
  database : 'Project1_DB'
});

//adding pool
//mysql connection
var readpool = mysql.createPool({
	connectionLimit: 500,
	//host: 'localhost',
	host: 'lavymysql.cnywgp1kyedu.us-east-1.rds.amazonaws.com',
	port: '3306',
	user: 'root',
	//password: 'lavanya', //local
	password: 'lavanyar',
	//database: 'edis',
	database: 'Project1_DB'
	
});

//mysql connection
var writepool = mysql.createPool({
	connectionLimit: 500,
	//host: 'localhost',
	host: 'lavymysql.cnywgp1kyedu.us-east-1.rds.amazonaws.com',
	port: '3306',
	user: 'root',
	//password: 'lavanya', //local
	password: 'lavanyar',
	//database: 'edis',
	database: 'Project1_DB'
});

//ending add pool
connection.connect(function(err){
if(!err) {
    console.log("Database is connected");    
} else {
    console.log("Error connecting database");    
}
});

//session mgmt

app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({
  secret: 'squishysquashygoo',
 resave: true,
  rolling: true,
  //redis store
	store: new redisStore({ host: 'redis-v2.gtjqw1.0001.use1.cache.amazonaws.com', port: 6379, client: client,ttl :  260}),
  saveUninitialized: false,
   cookie: { 
 //maxAge:15*60*1000
  }
 
}));

//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser()); // get information from html forms




//register
app.post('/registerUser', function (req, res) {
    var users = {
       fname: req.body.fname,
	   lname: req.body.lname,
	   address: req.body.address,
	   city: req.body.city,
	   state: req.body.state,
	   zip: req.body.zip,
	   email: req.body.email,
       username: req.body.username,
	   password: req.body.password,
	   role:'customer' //added
        }
		
		if(!req.body.fname || !req.body.lname || !req.body.address || !req.body.city || !req.body.state || !req.body.zip ||  !req.body.email || !req.body.username || !req.body.password){
		res.json({
       "message":"The input you provided is not valid"});
		}
		else{
		var username =req.body.username;
		readpool.getConnection(function(err,connection){
	connection.query('SELECT * FROM users where username=?', username,function(err,rows){
		if(err){
		//console.log("error ocurred",error);
		res.json({
      "failed":"error ocurred"
    })
		}
		
		if(!rows.length){
			//var msg = req.body.fname + " was registered successfully"; 
			writepool.getConnection(function(err,connection){
	connection.query('INSERT INTO users SET ?',users, function (error, results) {
		//console.log(req.body.fname + " was registered successfully");
    res.json({
       "message":req.body.fname + " was registered successfully" });
  });	
			});
}
else{
	res.json({
       "message":"The input you provided is not valid"});
}
	});
		});
		}
		});


//login
app.post('/login', function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    var userid_sql = "SELECT * FROM users where username=? and password=?";
	if(!username || !password){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
	}
	readpool.getConnection(function(err,connection){
	connection.query(userid_sql,[username,password],function(err,results){
	//console.log("result length"+ results.length);
		var rlength = results.length
				
		if(rlength <= 0){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
	}
		
		else if(!results){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});  
		}		
	
	else{
		var firstname = results[0].fname;
		//console.log("fname"+fname)
		// gets username of the user to set cookie
		var sessionname = results[0].username;
		req.session.user = sessionname;  // sets a cookie with the user's info
		var msg = "Welcome " + firstname;
		res.json({"message":msg});    
		   
	}
});
});
});



//update contact info
app.post('/updateInfo', function (req,res) {	
	if(req.session && req.session.user){	
var fusername = req.session.user;
	connection.query('SELECT * FROM users where username=?',fusername,function(err,rows){
	   ofname = rows[0].fname;
	   olname = rows[0].lname;
	   oaddress = rows[0].address;
	   ocity = rows[0].city;
	   ostate= rows[0].state;
	   ozip= rows[0].zip;
	   oemail= rows[0].email;
       ousername= rows[0].username;
	   opassword= rows[0].password;
	   //console.log(ofname);
	   
	   fname= req.body.fname;
	   lname= req.body.lname;
	   address= req.body.address;
	   city= req.body.city;
	   state= req.body.state;
	   zip= req.body.zip;
	   email= req.body.email;
       username= req.body.username;
	   password = req.body.password;
	   
	   if(ousername!=username){
	   	   
		   readpool.getConnection(function(err,connection){//lavy
	connection.query('SELECT * FROM users where username=?', username,function(err,rows){
		if(err){
		//console.log("error ocurred",error);
		res.json({
      "failed":"error ocurred"
    })
		}
		
		if(!rows.length){
			ousername=username;
}
else{
	res.json({
       "message":"The input you provided is not valid"});
}
	});
		   });//lavy
	   } 
	   
	   if(ofname!=fname){
	   ofname=fname;
	   }
	   
	   if(olname!=lname){
	   olname=lname;
	   }
	     
		  if(oaddress!=address){
	   oaddress=address;
	   }
	   
	   if(ocity!=city){
	   ocity=city;
	   }
	    if(ostate!=state){
	   ostate=state;
	   }
	   
	   if(ozip!=zip){
	   ozip=zip;
	   }
	    if(oemail!=email){
	   oemail=email;
	   }
	   	   
	   if(opassword!=password){
	   opassword=password;
	   }
	  
	   
	   writepool.getConnection(function(err,connection){//lavy
	   connection.query('UPDATE users SET fname=?,lname=?,address=?,city=?,state=?,zip=?,email=?,username=?,password=? where username=?',[ofname,olname,oaddress,ocity,ostate,ozip,oemail,ousername,opassword,fusername], function (error, results) {
		   if (error) {
		res.json({
      "failed":"error ocurred"}); }
		
		else{
				var msg = ofname + " your information was successfully updated";
		res.json({
			"success":msg });
			}
	   });//2nd con query
  
	}); //con query
	});//lavy
	}
	else{
		res.json({"message":"You are not currently logged in"});	
	}
});


//AddProducts
app.post('/addProducts', function (req,res) {
		if(req.session && req.session.user)
	{
		var username = req.session.user
		connection.query('SELECT role FROM users where username=?', username,function(err,rows){
		if(rows[0].role == 'admin'){
    var products = {
       asin: req.body.asin,
	   productName: req.body.productName,
	   productDescription: req.body.productDescription,
	   groups: req.body.group
        }
			if(!req.body.asin || !req.body.productName || !req.body.productDescription || !req.body.group || req.body.asin.trim().length==0 || req.body.productName.trim().length==0 ||  req.body.productDescription.trim().length==0 || req.body.group.trim().length==0){
		res.json({
       "message":"The input you provided is not valid"});
		}
			else{
			var asin =req.body.asin;
			
			readpool.getConnection(function(err,connection){
	connection.query('SELECT * FROM products where asin=?', asin,function(err,rows){
		//console.log(rows.length)
		if(err){
		res.json({
      "failed":"error ocurred"})
		}
		if(!rows.length){
			writepool.getConnection(function(err,connection){
	connection.query('INSERT INTO products SET ?',products, function (error, results) {
	//	var msg = req.body.productName + " was successfully added to the system"
    res.json({
      "message":req.body.productName + " was successfully added to the system"});
			}); });	}
	else{
	res.json({
      "message":"The input you provided is not valid"});
			}   }); });	} } 
	//fixed
	else{
		res.json({
      "message":"You must be an admin to perform this action"
	        }); } });
	}
	else{
	res.json({
     "message":"You are not currently logged in"}); 
}  
});



//modifyProduct
app.post('/modifyProduct', function (req, res) {
		if(req.session && req.session.user)
	{
		var username = req.session.user
		readpool.getConnection(function(err,connection){
		connection.query('SELECT role FROM users where username=?', username,function(err,rows){
		if(rows[0].role == 'admin'){
 var info = {
	   productName: req.body.productName,
	   productDescription: req.body.productDescription,
	   groups: req.body.group
        };
		if(!req.body.asin || !req.body.productName || !req.body.productDescription || !req.body.group){
				res.json({
				"message":"The input you provided is not valid"});
			 }
	else{
	var asin =req.body.asin;
		//console.log('ASIN'+asin);	
		readpool.getConnection(function(err,connection){
	connection.query('select * from products where asin=?',asin,function(err,row){   //demon
		if(err){
			//console.log(err);
		res.json({
		"failed":"error ocurred"})
		}
//		console.log('Length'+row.length);
		//console.log('ASIN'+asin);	
		if(row.length>0){
			writepool.getConnection(function(err,connection){
	connection.query('UPDATE products SET ? where asin=?',[info,asin],function(error,results) {

		var msg = req.body.productName + " was successfully updated"
    res.json({
      "message":msg});
			});	});} 
			else{
		res.json({
      "message":"The input you provided is not valid"});
		}   }); });	} } 
	else{
		res.json({
      "message":"You must be an admin to perform this action"});
		} }); }); }
	else{
	res.json({
     "message":"You are not currently logged in"}); 
}  });


//viewUsers
app.post('/viewUsers', function (req, res) {
		if(req.session && req.session.user)
	{	var username = req.session.user
	readpool.getConnection(function(err,connection){
		connection.query('SELECT role FROM users where username=?', username,function(err,rows){
		if(rows[0].role == 'admin'){
		var fname =req.body.fname;
		var lname = req.body.lname;
		
		if(!fname && !lname){	
		readpool.getConnection(function(err,connection){
		connection.query('SELECT fname,lname,username FROM users',function(err,rows){
			if(err){
		res.json({
       "failed":"error ocurred"});
	   
		}
		if(!rows.length){
		res.json({
		"message": "There are no users that match that criteria"});
		}	
		else{
			 res.json({
		"message": "The action was successful",
		"user": rows });
		}  //adhu
		});
		});
		}	
		
		if(fname && lname){
			readpool.getConnection(function(err,connection){
		connection.query('SELECT fname,lname,username FROM users where fname=? and lname=?', [fname,lname],function(err,rows){
			
		if(err){
		//console.log(err);
		res.json({
       "failed":"error ocurred lavy"});
		}
		res.json({
		"message": "The action was successful",
		"user": rows });
		}); 
			});
		}
		
		//***************** lavdemon
		filfname = "%" + fname + "%";
		fillname = "%" + lname + "%";
		
		if(fname || lname){	
		readpool.getConnection(function(err,connection){
		connection.query('SELECT fname,lname,username FROM users where fname LIKE ? and lname LIKE ?',[filfname,fillname],function(err,rows){
			if(err){
		res.json({
       "failed":"error ocurred"});
	   
		}
		if(!rows.length){
		res.json({
		"message": "There are no users that match that criteria"});
		}	
		else{
			 //res.json(rows);} //adhu
			 res.json({
		"message": "The action was successful",
		"user": rows });}
		});
		});
		}	
		
		if(fname && lname){
			readpool.getConnection(function(err,connection){
		connection.query('SELECT fname,lname,username FROM users where fname=? and lname=?', [fname,lname],function(err,rows){
			
		if(err){
		//console.log(err);
		res.json({
       "failed":"error ocurred lavy"});
		}
		res.json({
		"message": "The action was successful",
		"user": rows });
		}); 
			});
		}
		//*******************
		
		
			
		else{
			readpool.getConnection(function(err,connection){
		connection.query('SELECT fname,lname,username FROM users where fname=? or lname=?', [fname,lname],function(err,rows){
			
		if(err){
			//console.log(err);
		res.json({
       "failed":"error ocurred lavy"});
		}
		res.json({
		"message": "The action was successful",
		"user": rows });
		})
			});
			;}
		}
	else{
		res.json({
      "message":"You must be an admin to perform this action"}); 
	  } 
	});  });}
	else{
	res.json({
     "message":"You are not currently logged in"}); 
} });



//viewProducts
app.post('/viewProducts', function (req, res) {
		    		
		var asin =req.body.asin;
		var keyword =req.body.keyword;
		var groups = req.body.group;
			
		filasin = "%" + asin + "%";
		filkeyword ="%" + keyword + "%"; 
		filgroups ="%" + groups + "%";
		
		if(asin) {
			
			readpool.getConnection(function(err,connection){
		connection.query('SELECT asin,productName FROM products where MATCH(productName,productDescription) against ('+filkeyword+') and match(groups) against('+filgroups +')',function(error,results,fields){
		if(error || results.length <= 0){
			return res.json({message: 'There are no products that match that criteria'});
		}
		return res.json({product: results});
			});	});
	}
	if(!asin) {
		readpool.getConnection(function(err,connection){
		connection.query('SELECT asin,productName FROM products WHERE MATCH(asin) against(+filasin+)',function(error,results,fields){
		if(error || results.length <= 0){
			return res.json({message: 'There are no products that match that criteria'});
		}
		return res.json({product: results});
		});
		});
	}
});


//purchase products
app.post('/buyProducts', function(req, res) {
	if(req.session && req.session.user) {
		var user = req.session.user;
		var products = req.body.products;
		var ListOfProductIds = [];
		for(var i=0;i< products.length;i++) {
			ListOfProductIds[i] = products[i].asin;
		}
		console.log("List Of Product IDs" + ListOfProductIds);
		
		var utcDate = new Date().getTime();
		writepool.getConnection(function(err,connection){
		connection.query('INSERT into orderDetails (user,purchaseTime) values (?,?)',[user,utcDate],function(error,results,fields){
				if(error || results.length <= 0){
					console.log("Error updating the order details");
				}
				console.log("Order details inserted successfully");
				var orderID = 0;
				readpool.getConnection(function(err,connection){
				connection.query('SELECT orderID from orderDetails where user=? and purchaseTime=?',[user,utcDate],function(error, results, fields) {
					if(error || results.length <= 0) {
						console.log("No matching Order ID");
					}
					orderID = results[0].orderID;
					console.log("orderID " + orderID);
					var params = "";
					for(var i=0; i<ListOfProductIds.length; i++) {
						if(params.length > 0) {
							params += ",";
						}
						params += `('${user}','${ListOfProductIds[i]}','${orderID}')`;
					}
					console.log("parameters" + params);
					
					var query = 'INSERT into purchaseHistory values ' + params;
					writepool.getConnection(function(err,connection){
					connection.query(query, function(error, resultss, fields) {
						if(error) {
							
							return res.send({message: "There are no products that match that criteria"});
						}
						return res.send({message: "The action was successful"});
					});
					});
				});
				});
		});
		});
	}
	else {
		return res.send({message: "You are not currently logged in"});
	}
});

//productsPurchased

app.post( '/productsPurchased',  function(req, res, next) { 
var name= req.session.user;
var username = req.body.username;

if(typeof name === 'undefined' || name == null)
{  res.send('You are not currently logged in');   }

else if( name != "jadmin") 
{   res.send('You must be an admin to perform this action');	}    
readpool.getConnection(function(err,connection){
connection.query('SELECT b.productName as pname, a.asin, count(a.asin) as qty from edis.purchaseHistory a, edis.products b where a.user =? and a.asin=b.asin group by a.asin',[username], function(err,rows)
	{   
  	 if (!err && rows.length > 0 )
    {   
          var obj= '{"message":"The action was successful","products":[';    
          var results = [];
          for(var i =0; i< rows.length; i++)
          {
              var temp= '{"productName":"'+rows[i].pname+'","quantity":"'+rows[i].qty+'"}';
              results.push(temp);
          }
          obj=obj+results+']}';
          res.setHeader('Content-Type', 'application/json');
          return res.send(obj);
    }
   else {res.send('There are no users that match that criteria');	  }   
}); });
(req,res,next);
});

//getRecommendations
app.post( '/getRecommendations',  function(req, res) { 
var name= req.session.user;
var asin = req.body.asin;

if(typeof name === 'undefined' || name == null)
{  res.send('You are not currently logged in');   }
readpool.getConnection(function(err,connection){
connection.query('select asin from  (select asin from purchaseHistory where orderid in (select DISTINCT orderid from purchaseHistory where asin=?) and asin !=?) as temp group by asin order by count(asin) desc limit 5',[asin,asin],function(error,results){
	if(error || results.length <= 0){
			return res.json({message: 'There are no recommendation for that products'});
		}
		return res.json({message: 'The action was successful',product: results});
}); })
});

//logout 
app.post('/logout', function(req, res) {
	    if (req.session && req.session.user) {
  req.session.destroy(function(){
  res.json({"message" : "You have been successfully logged out"});	})
  }
else{
	res.json({"message":"You are not currently logged in"});	
}
}); //lavy

//launching 
app.listen(port);
console.log('Connection on port ' + port);