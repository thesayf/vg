var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var uid2 = require('uid2');
var User = require(__dirname + '/models/user');
var Driver = require(__dirname + '/models/driver');
var Staff = require(__dirname + '/models/staff');
var mongojs = require('mongojs');
var db = mongojs('contactlist', ['contactlist']);

var testVar = 'the dunya';
var testVar2 = 'the dunya 2';


module.exports = function(app, Quote, Token, User, Contact, needle, rest) {

	/////  CONTACTS  /////
    app.post('/api/contactlist', function (req, res) {
        Contact.find({'userID': req.user._id}, function (err, docs) {
            res.json({
                success:true,
                message: "Saved",
                status: 1,
                data:docs
            })
        });
    });

    app.post('/api/add-contact', function (req, res){
        var contact = new Contact();
        contact.userID = req.user._id;
        contact.organization = req.body.contact.organization;
        contact.name = req.body.contact.name;
        contact.relationship = req.body.contact.relationship;
        console.log(req.body);
        contact.save(function(err, user){
            if(err){
                return done(err);
            } else {
                res.json({
                    success:true,
                    message: "Saved",
                    status: 1
                })
            }
        });
    });


	/////  LOGIN SYSTEM  /////
	app.post("/api/login", passport.authenticate('local'), function(req, res){
        res.json(req.user);
	});

	app.post("/api/signin", passport.authenticate('local-admin'), function(req, res){
        console.log("YOYOYO");
		res.json(req.staff);
	});

    app.post("/api/driversignin", passport.authenticate('local-driver'), function(req, res){
        console.log("YOYOYO");
		res.json(req.driver);
	});

	// logs the user out by deleting the cookie
	app.post("/api/logout", function(req, res){
		req.logOut()
		res.json(req.user);
	});

	// This uses passport to uathenticate based on our parameters
	app.post("/api/login-auth",  function(req, res) {
		res.send(req.isAuthenticated() ? req.user : '0');
	});

	//authenitcates staff login
	app.post("/api/signin-auth",  function(req, res) {
		res.send(req.isAuthenticated() ? req.staff : '0');
	});

	//This registers the Users
	app.post("/api/register", function(req, res){

        req.body.username = 'test';

		User.findOne({username: req.body.username}, function(err, user){
			if(user){
			 	return res.json({
					success: false,
					message: "This user already exists"
				});
			} else {
		   		var user = new User();
				/*user.username = req.body.username;
				user.password = req.body.password;
				user.email = req.body.email;
				user.businessname = req.body.businessname;
				user.address = req.body.address;
				user.doornumber = req.body.doornumber;
				user.city = req.body.city;
				user.postcode = req.body.postcode;
				user.businesstype = req.body.businesstype;
				user.firstname = req.body.firstname;
				user.lastname = req.body.lastname;
				user.mobile = req.body.mobile;*/
				user.username = 'test';
				user.password = '123';
				user.email = 'test@test.com';
				user.businessname = 'test biz';
				user.address = 'test address';
				user.doornumber = '103';
				user.city = 'test city';
				user.postcode = 'cr77jj';
				user.businesstype = 'tester';
				user.firstname = 'test first';
				user.lastname = 'test last';
				user.mobile = '07894564444';
                // Save to mongo
				user.save(function(err, user){
                    // Get Tdisptch Token
                    td.getAccessToken(function(access) {
                        // Create Tdispatch account for user
                        td.createAccount(user, access, function(data) {
                            console.log(data);
                            req.login(user, function(err){
        						if(err) {
        							return res.json({
        								success: false,
        								message: "Sorry you have been unable to login at this time, please try again later"
        							});
        						}
        						return res.json({
        							success: true,
        						});
        					});
                        })
                    })
				});
			} //else close
		});
	});


	//**USERLIST** Displays our users information in the admin User Page.
 	app.post('/api/userlist', function (req, res) {
		User.find({},{password: 0}, function (err, docs) {
			res.json({
				success:true,
				message: "found",
				status: 1,
				data:docs
			})
		});
	});

	//**driverlist** Displays our driver information in the admin Driver Page.
 	app.post('/api/driverlist', function (req, res) {
		Driver.find({},{password: 0}, function (err, docs) {
			console.log(docs);
			res.json({
				success:true,
				message: "found",
				status: 1,
				data:docs
			})
		});
	});

	app.post('/api/stafflist', function (req, res) {
		Staff.find({},{password: 0}, function (err, docs) {
			res.json({
				success:true,
				message: "found",
				status: 1,
				data:docs
			})
		});
	});

	//Signs New drivers up to the platform to allow us to investigate and activate there account.
 	app.post("/api/signup", function(req, res){
		Driver.findOne({username: req.body.username}, function(err, driver){
			if(driver){
			 	return res.json({
					success: false,
					message: "This user already exists"
				});
			} else {
			   	var driver = new Driver();
				driver.username = req.body.username;
				driver.password = req.body.password;
				driver.email = req.body.email;
				driver.firstname = req.body.firstname;
				driver.lastname = req.body.lastname;
				driver.mobile = req.body.mobile;
				driver.day = req.body.day;
				driver.month = req.body.month;
				driver.year = req.body.year;
				driver.address = req.body.address;
				driver.city = req.body.city;
				driver.postcode = req.body.postcode;
				driver.vehicle = req.body.vehicle;
				driver.reg = req.body.reg;
				driver.porters = req.body.porters;
				driver.vehiclenumber = req.body.vehiclenumber;
				driver.bank = req.body.bank;
				driver.acc = req.body.acc;
				driver.sc = req.body.sc;
				driver.save(function(err, driver){
					return res.json({
						success: true,
					});
				});
			} //else close
		});
	});

	app.post("/api/addstaff", function(req, res){
		Staff.findOne({username: req.body.username}, function(err, staff){
			if(staff){
		 		return res.json({
					success: false,
					message: "This user already exists"
				});
			} else {
		   		var staff = new Staff();
				staff.username = req.body.username;
				staff.password = req.body.password;
				staff.email = req.body.email;
				staff.firstname = req.body.firstname;
				staff.lastname = req.body.lastname;
				staff.position = req.body.position;
				staff.save(function(err, staff){
				   	return res.json({
						success: true,
					});
				});
			} //else close
		});
	});


	/////  T DISPATCH  /////
	app.post('/api/tdispatch-book', function(req, res) {
		//var temp = res.data;
		var temp = {};
		td.getAccessToken(function(access) {
			td.bookJob(temp, access, function(data) {
				console.log(data);
			})
		})
	})

	app.post('/api/tdispatch-calc', function(req, res) {
		td.getAccessToken(function(access) {
			td.calcFare(res, access, function(data) {
				res.json({
					success: true,
					message: 'calc complete',
					data: data
				});
			})
		})
	})

	app.post('/api/save-instant-job', function(req, res) {
		var quote = new Quote();

		// set the user's local credentials
		quote.jobName = req.body.data.jobName;
		quote.vanType = req.body.data.vanType;
		quote.porterQty = req.body.data.porterQty;
		quote.jobDate = req.body.data.jobDate;
		quote.fuelPrice = req.body.data.fuelPrice;
		quote.suggestedPrice = req.body.data.suggestedPrice;
		quote.address = req.body.data.address;
		quote.distance = req.body.data.distance;

		// save the quote
		quote.save(function(err) {
			console.log(err);
			if(err) {
				return done(false);
			} else {
				res.json({
					success: true,
					message: 'Quote Saved'
				});
			}
		});
	})

	app.get('*', function(req, res) {
        res.render('pages/index');
    });


	var func = {};

	func.param = function(data) {
	    return Object.keys(data).map(function(key) {
	        return [key, data[key]].map(encodeURIComponent).join("=");
	    }).join("&");
	}

	var td = {};

    td.clientId = 'iesgbqOcGs@tdispatch.com';
    td.clientSecret = 'PeYQRXDWWFAa3WQR7UwHJRs2DZD5eKsP';

    td.tokenUrl = 'http://api.tdispatch.com/passenger/oauth2/token';
    td.calcFareUrl = 'http://api.tdispatch.com/passenger/v1/locations/fare';
    td.bookJobUrl = 'http://api.tdispatch.com/passenger/v1/bookings';
    td.createAccountUrl = 'http://api.tdispatch.com/passenger/v1/passengers';

	td.getAccessToken = function(callback) {
		Token.find({}, function(err, docs) {
			callback(docs[0]['access']);
		})
	}

	td.getRefreshToken = function(callback) {
		Token.find({}, function(err, docs) {
			callback(docs[0]['refresh']);
		})
	}

    td.saveTokens = function(tokens, callback) {
    	var token = new Token();
    	token.access = tokens['access_token'];
    	token.refresh = tokens['refresh_token'];
    	token.save(function(err) {
    		if(err) {
    			callback(false);
    		} else {
    			callback(true);
    		}
    	});
    }

    td.createAccount = function(user, access, callback) {
        var info = {
            "username": user.username,
            "name": user.firstname+' '+user.lastname,
            "phone": user.mobile
        };

        var url = td.createAccountUrl+'?access_token='+access;

 		rest.postJson(url, info).on('complete', function(data, resp) {
 			callback(data);
 		});
    }

	td.calcFare = function(data, access, callback) {
		var info = data.req.body.data;
		var jsonFare = {
		    "pickup_location": {
		        "lat": info.address.start_location.lat,
		        "lng": info.address.start_location.lng
		    },
		    "dropoff_location": {
		        "lat": info.address.end_location.lat,
		        "lng": info.address.end_location.lng
		    },
		    /*"way_points": [
		        {
		            "lat": 52.393385,
		            "lng": 13.036222
		        }
		    ],*/
		    "pickup_time": info.jobDate,
		    "payment_method": info.payment_method,
		    //"voucher": "FREECODE",
		    //"minutes_waited": 5,
		    //"allocated_hours": 3.5,
		    "car_type": "51fbd9d36e77c304c0fc4fea",
		    "passengers": 1,
		    "luggage": 1
		    /*"extras": [
		        "5154a1256e77c322e4973765",
		        "51b682aa6e77c375af324bcd"
		    ]*/
		}

		/*var url = td.calcFareUrl+'?access_token='+access;

		rest.postJson(url, jsonFare).on('complete', function(data, resp) {
			callback(data);
		});*/

	}

	td.bookJob = function(data, access, callback) {
		var data = {"passenger": {"name": "Pablo Escobar", "phone": "+49123470416", "email": "esco@tdispatch.com"},
			 "pickup_time": "2016-05-07T10:30:00-02:00",
			 "return_time": "2016-05-09T10:30:00-02:00",
			 "pickup_location": {
				 "postcode": "cr77jg",
				 "location": {"lat": 51.3982168, "lng": -0.09966780000002018},
				 "address": "B266, Thornton Heath"
			 },
			 /*"way_points": [
				 {"postcode": "13355", "location": {"lat": 52.542381, "lng": 13.392463}, "address": "Voltastra\u00dfe 100"}
			 ],*/
			 "dropoff_location": {
				 "postcode": "e33rd",
				 "location": {"lat": 51.51974509999999, "lng": -0.020408699999961755},
				 "address": "Watts Grove (Stop BL)"
			 },
			 "luggage": 5,
			 "passengers": 3,
			 "extra_instructions": "The three guys in blue.",
			 "payment_method": "cash",
			 "pre_paid": false,
			 "status": "incoming",
			 "vehicle_type": "d9497b171f52d75e72d5051f",
			 //"extras": ["510031e06e77c31c03000d1b", "5089aa156e77c311fc000bf1"]
			 //"voucher": "ABCD1234",
	 	};

		var url = td.bookJobUrl+'?access_token='+access;

		rest.postJson(url, data).on('complete', function(data, resp) {
			callback(data);
		});
	}

    td.getTokens = function(authCode, callback) {
    	var options = {
    		code: ''+authCode+'',
    		client_id: td.clientId,
    		client_secret: td.clientSecret,
    		//redirect_uri: '',
    		grant_type: 'authorization_code',
    		response_format: 'json'
    	};

    	options = func.param(options);

    	var url = td.tokenUrl;

    	needle.post(url, options, function(err, resp, body) {
    		callback(body);
    	});
    }

    td.refreshToken = function(refreshToken) {
        var options = {
            refresh_token: refreshToken,
            client_id: td.clientId,
            client_secret: td.clientSecret,
            grant_type: 'refresh_token',
        };
        options = func.param(options);

        var url = td.tokenUrl+'?'+options;
        console.log(url);
        var databody = {'username': 'test444@test.com', 'password': '123'};

        rest.postJson(url, databody).on('complete', function(data, resp) {
			console.log(data);
		});

    }



//THIS IS THE USER SIGN IN CONDITIONS///
	passport.use('local', new localStrategy(function(username, password, done){
	    User.findOne({username: username, password: password}, function(err, user){
	        if(user){return done(null, user);}
	    	return done(null, false, {message: 'Unable to login'});
	    });
	}));

	passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });


//THIS IS THE STAFF SIGN IN CONDITIONS///

    passport.use('local-admin', new localStrategy(function(username, password, done){
	    Staff.findOne({username: username, password: password}, function(err, staff){
	        if(staff){return done(null, staff);}
	    	return done(null, false, {message: 'Unable to login'});
	    });
	}));

	passport.serializeUser(function(staff, done) {
        done(null, staff);
    });
    passport.deserializeUser(function(staff, done) {
        done(null, staff);
    });


    // THIS IS THE Driver SIGN IN CONDITIONS//

    passport.use('local-driver', new localStrategy(function(username, password, done){
	    Driver.findOne({username: username, password: password}, function(err, driver){
	        if(driver){return done(null, driver);}
	    	return done(null, false, {message: 'Unable to login'});
	    });
	}));

	passport.serializeUser(function(driver, done) {
        done(null, driver);
    });
    passport.deserializeUser(function(driver, done) {
        done(null, driver);
    });



}; // EXPORT








/*td.authCode = function(callback) {

	var options = {
		key: 'c5c13f4fe1aac89e417c879c0d8554ae',
		response_type: 'code',
		client_id: 'iesgbqOcGs@tdispatch.com',
		//redirect_uri: '',
		scope: '',
		//grant_type: 'user',
		response_format: 'json'
	};

	options = func.param(options);

	var url = 'http://api.tdispatch.com/passenger/oauth2/auth?'+options;
	var databody = {'username': 'test444@test.com', 'password': '123'};

	needle.post(url, databody, function(err, resp, body) {
		callback(body['auth_code']);
	});
}*/

/*td.getTokens = function(authCode, callback) {
	var options = {
		code: ''+authCode+'',
		client_id: 'iesgbqOcGs@tdispatch.com',
		client_secret: 'PeYQRXDWWFAa3WQR7UwHJRs2DZD5eKsP',
		//redirect_uri: '',
		grant_type: 'authorization_code',
		response_format: 'json'
	};

	options = func.param(options);

	var url = 'http://api.tdispatch.com/passenger/oauth2/token';

	needle.post(url, options, function(err, resp, body) {
		callback(body);
	});

*/
/*td.authCode(function(authCode) {
	if(authCode) {
		td.getTokens(authCode, function(tokens) {
			td.saveTokens(tokens, function() {

			})

		})
		res.json({
			success: true,
			message: 'Auth Code Success',
			data: authCode
		});
	}
});*/
