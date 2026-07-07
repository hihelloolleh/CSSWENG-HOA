const express                  = require('express');
const router                   = express.Router();
const boardMemberController  = require('../controllers/boardMemberController');

router.get('/', boardMemberController.getBoardMembers);
router.post('/', boardMemberController.addBoardMember);
router.post('/:id/delete', boardMemberController.deleteBoardMember);
router.post('/:id/update', boardMemberController.updateBoardMember);

module.exports = router;
