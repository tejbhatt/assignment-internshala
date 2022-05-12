var fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const jwtKey = "my_secret_key"

exports.signUp = (req, res, next) => {

    userdetails = validateName(req)
    username = validateUsername(req)
    password = validatePassword(req)
    sendResponse(userdetails, username, password, res)
    if (userdetails != undefined && username != undefined && username.length > 3 && password != undefined) {
        bcrypt.hash(password, 10)
            .then(hashedpassword => {
                userData = {
                    username: username,
                    password: hashedpassword,
                    fname: userdetails.firstname,
                    lname: userdetails.lastname
                }
                var userjson = JSON.stringify(userData);
                fs.writeFile('user.json', userjson, 'utf8', function (err) {
                    if (err) throw err;
                    console.log('complete');
                });
            })

        res.status(201).json({
            result: true,
            message: "SignUp success. Please proceed to Signin"
        })
    }
};


exports.signIn = (req, res, next) => {
    const { password } = req.body
    var text = fs.readFileSync('user.json', 'utf8')
    userData = JSON.parse(text); //now it an object
    bcrypt.compare(password, userData.password)
        .then(doMatch => {
            if (doMatch) {
                const token = jwt.sign({ username: userData.username, fname: userData.fname }, jwtKey)
                res.status(200).json({ result: true, jwt: token, message: "Signin success" })
            } else {
                return res.status(404).json({ error: "Invalid Email or Password" })
            }
        })
};

exports.getUser = (req, res, next) => {
    token = checkJWT(req, res)
    if (token != undefined) {
        jwt.verify(token, jwtKey, (err, authorizedData) => {
            if (err) {
                res.status(400)
                    .json({
                        result: false,
                        error: "JWT Verification Failed"
                    })
            }
            else {
                var text = fs.readFileSync('user.json', 'utf8')
                userData = JSON.parse(text);
                if (authorizedData.username == userData.username) {
                    res.status(200)
                        .json({
                            result: 'true',
                            data: {
                                "fname": userData.fname,
                                "lname": userData.lname,
                                "password": userData.password
                            }
                        });
                }
            }
        })
    }
};

function checkJWT(req, res) {
    const header = req.headers['authorization'];
    if (typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
        req.token = token;
        return req.token
    }
    else {
        res.status(400)
            .json({
                result: false,
                error: "Please provide a JWT token"
            })
    }
}

function validateUsername(req) {
    const regexUsername = new RegExp(/^[a-z]+$/);
    if (regexUsername.test(req.body.username) == true) {
        username = req.body.username
        return username
    }
}

function validateName(req) {
    const regexForName = new RegExp(/[A-Za-z]+/);
    user = {}
    if (regexForName.test(req.body.fname) == true && regexForName.test(req.body.lname) == true) {
        user.firstname = req.body.fname;
        user.lastname = req.body.lname
        return user
    }
}

function validatePassword(req) {
    const regexForPassword = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/);
    if (regexForPassword.test(req.body.username) == true) {
        password = req.body.password
        return password
    }
}
function sendResponse(userdetails, username, password, res) {
    if (username == undefined && userdetails == undefined) {
        res.status(400).json({ message: "Both the fields are invalid" })
    }
    else if (userdetails == undefined) {
        res.status(400).json({ message: "First and Last name must only contain the English alphabets [a-zA-Z]" })
    }
    else if (username == undefined) {
        res.status(400).json({ message: "Username can only contain lowercase character [a-z]" })
    }
    else if (username.length <= 3) {
        res.status(400).json({ message: "Username length must be at least 4" })
    }
    else if (password == undefined) {
        res.status(400).json({
            message:
                "Password must contain at least 1 uppercase character " +
                "Password must contain at least 1 lowercase character " +
                "Password must contain at least 1 number " +
                "Password no special characters allowed " +
                "Password should be of at least 5 characters "
        })
    }

}