// BOARD MEMBER CONTROLLER
// manages the Board Member table  
// SPRINT 2+: connect all functions to the database via models.
const boardMemberModel = require('../models/boardMemberModel');

const getBoardMembers = async (req, res) => {
    try {
        const boardMembers = await boardMemberModel.getAllBoardMembers();

        res.render('boardMembers', {
            title:      'Board Members',
            activePage: 'boardMembers',
            pageCSS:    'board-members.css',
            boardMembers,
            error:      req.query.error   || null,
            success:    req.query.success || null,
        });
    } catch(err) {
        console.log("Error fetching board members: ", err);
        return res.status(500).send('Failed to load board members');
    }
    
};

const addBoardMember = async(req, res) => {
    try {
        await boardMemberService.addBoardMember(req.body);
        res.redirect('/boardMembers?success=boardMember+added+successfully.');
        
    } catch(err) {
        console.log("Failed to add board member: ", err);
       res.redirect(`/boardMembers?error=${encodeURIComponent(err.message)}`);
       //if error is duplicate board members, 
    }
}

const updateBoardMember = async(req, res) => {
    try {
        const data = {
            ...req.body,
            boardMemberId: req.params.id
        };
        
        await boardMemberService.updateBoardMember(data);
        res.redirect('/boardMembers?success=boardMember+updated+successfully.');
    } catch(err) {
        console.error('Edit board member error: ', err);
        res.redirect('/boardMembers?error=Failed+to+update+boardMember.');
    }
    
};

const deleteBoardMember = async (req, res) => {
    try {
        await boardMemberModel.deleteboardMember(req.params.id)
        return res.redirect('/boardMembers');
    } catch(err) {
        console.log("Failed to delete board member: ", err);
        return res.redirect('/boardMembers?error=Failed+to+delete+boardMember');
    }
};

module.exports = {
    getBoardMembers,
    addBoardMember,
    deleteBoardMember, 
    updateBoardMember
};