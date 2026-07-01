const express                  = require('express');
const router                   = express.Router();
const boardMemberController  = require('../controllers/boardMemberController');

// GET  /property-owners        → list all property owners
// POST /property-owners        → assign an owner to a property  (SPRINT 2+)
// PUT  /property-owners/:id    → update assignment              (SPRINT 2+)
// DELETE /property-owners/:id  → remove assignment              (SPRINT 2+)

router.get('/', boardMemberController.getBoardMembers);

module.exports = router;
