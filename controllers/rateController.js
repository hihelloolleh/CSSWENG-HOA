const rateModel = require('../models/rateModel');
const rateService = require('../services/rateService');

exports.getRatesPage = async (req, res) =>{

    try{
        const rates = await rateModel.getActiveRates();

        res.render('rates', {
            title: 'Rates',
            rates,
            error: req.query.error,
            success: req.query.success
        });
    }
    catch(error){
        console.error('Error loading data for rates', error);
        res.status(500).send("Server Error: Failed to load rates data.");
    }
};

exports.updateRate = async (req,res) =>{
    const rateID = req.body.rate_id;
    const { amount } = req.body;

    try{
        await rateService.updateRate(rateId, amount);

        res.redirect('/rates?success=Rate updated successfully!');
    }
    catch (error){
        res.redirect(`/rates?error=${encodeURIComponent(error.message)}`);
    }
    
};