const express = require('express');
const postsController = require('../controllers/postsController.js')
const { identifier } = require('../middlewares/identification.js');
const router = express.Router();

router.get('/all-posts', postsController.getPosts)
// router.get('/single-post', authController.signin)
// router.post('/create-post', identifier, authController.signout)

// router.put('/update-post', identifier, authController.sendVerificationCode);
// router.delete('/delete-post', identifier, authController.verifyVerificationCode);

    


module.exports = router;