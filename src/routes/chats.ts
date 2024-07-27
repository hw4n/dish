import * as express from 'express';
const router = express.Router();

const chatsController = require('../controllers/chatsController');

router.route('/')
    .get(chatsController.getChats);

module.exports = router;
