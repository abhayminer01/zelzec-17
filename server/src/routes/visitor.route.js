const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');

router.post('/record', visitorController.recordVisit);
router.get('/stats', visitorController.getVisitorStats);

module.exports = router;
