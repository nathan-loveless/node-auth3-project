const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model.js');
const secrets = require('../config/secrets');

// for endpoints beginning with /api/auth
router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = genToken(user);

        res.status(200).json({
          message: `Welcome ${user.username}!`,
          token: token
        });
      } else {
        res.status(401).json({ message: 'You shall not pass!' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function genToken(user) {
  const payload = {
    userid: user.id,
    username: user.username,
    department: user.department
    // Other things: right/privilages? other info?
  };      
  const options = { 
      expiresIn: '1h'};      
  const token = jwt.sign(payload, secrets.jwtSecret, options);
  
  return  token;
}

module.exports = router;