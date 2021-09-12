var express = require('express');
var router = express.Router();
var User = require('../models/users')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Register user */

router.post('/register', async(req, res)=>{
  try {
    const user = new User(req.body)
    await user.save()
    res.send({message: 'tracking started'})
  } catch (error) {
    res.status(500).send({message: error})
  }
})

router.post('/disable',async(req, res) => {
  try {
    await User.findOneAndUpdate({phone: req.body.phone},{status: false},{new: true},{useFindAndModify: true})
    res.send({message: 'user disabled'})
  } catch (error) {
    res.status(500).send({message: error})
  }
})

router.post('/check-phone', async(req, res)=>{
  try {
    const isExist = await User.find({phone: req.body.phone})
    if(isExist.length>0){
      res.send({message: 'user exist'})
    }
    else {
      res.send({message: 'user not exist'})
    }
  } catch (error) {
    res.status(500).send({message: error})
  }
})

module.exports = router;
