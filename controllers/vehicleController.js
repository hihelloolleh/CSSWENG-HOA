const vehicleService = require('../services/vehicleService');
const VehicleModel = require('../models/vehicleModel'); // Keep this if get/delete still use it directly

exports.getVehicles = async (req, res) =>{
    try{
        const vehicles = await VehicleModel.getAllVehicles();
        const residents = await VehicleModel.getAllResidents();

        res.render('vehicles', {
            title: 'Vehicles',
            activePage: 'vehicles',
            pageCSS: 'vehicles.css',
            vehicles: vehicles,
            residents: residents
        });
    }
    catch(error){
        console.error("Cannot fetch vehicles:", error);
        res.status(500).send("Server Error loading vehicles.");
    }
};

exports.registerVehicle = async (req, res) =>{
    // cleaning
    const plate_number = req.body.plate_number ? req.body.plate_number.trim().toUpperCase() : '';
    const type = req.body.type ? req.body.type.trim() : '';
    const make = req.body.make ? req.body.make.trim() : '';
    const model = req.body.model ? req.body.model.trim() : '';
    const color = req.body.color ? req.body.color.trim() : '';
    const sticker_year = req.body.sticker_year || null;
    
    let resident_ids = req.body.resident_ids;

    if(resident_ids){
        resident_ids = Array.isArray(resident_ids) ? resident_ids : [resident_ids];
    }
    else{
        resident_ids = [];
    }
    
    // initial validation 
    if (!plate_number) {
        return res.status(400).send("Plate number is required.");
    }

    if (!type || !plate_number || !make || !model || !color || resident_ids.length === 0) {
        return res.redirect('/vehicles?error=Type,+Plate+number,+Make,+Model,+Color,+and+Residents+are+required.');
    }

    // redirect to services for the uhhhhhh services stuff
    try{
        const vehicleData = { type, plate_number, make, model, color, sticker_year };
        
        await vehicleService.registerVehicle(vehicleData, resident_ids);

        res.redirect('/vehicles?success=Vehicle+added+successfully');
    }
    catch(error){
        console.error("Cannot save vehicle:", error.message);
        res.redirect('/vehicles?error=' + encodeURIComponent(error.message));
    }
};

exports.updateVehicle = async (req, res) =>{
    const vehicleId = req.params.id;
    
    // cleaning
    const type = req.body.type ? req.body.type.trim() : '';
    const plate_number = req.body.plate_number ? req.body.plate_number.trim().toUpperCase() : '';
    const make = req.body.make ? req.body.make.trim() : '';
    const model = req.body.model ? req.body.model.trim() : '';
    const color = req.body.color ? req.body.color.trim() : '';
    const sticker_year = req.body.sticker_year || null;
    
    let resident_ids = req.body.resident_ids;

    if(resident_ids){
        resident_ids = Array.isArray(resident_ids) ? resident_ids : [resident_ids];
    }
    else{
        resident_ids = [];
    }
    
    // initial validation
    if (!type || !plate_number || !make || !model || !color || resident_ids.length === 0) {
        return res.redirect('/vehicles?error=Type,+Plate+number,+Make,+Model,+Color,+and+Residents+are+required.');
    }

    // los servicios
    try{
        const vehicleData = { type, plate_number, make, model, color, sticker_year };
        
        await vehicleService.updateVehicle(vehicleId, vehicleData, resident_ids);

        res.redirect('/vehicles?success=Vehicle+updated+successfully');
    }
    catch(error){
        console.error("Cannot update vehicle details:", error.message);
        res.redirect('/vehicles?error=' + encodeURIComponent(error.message));
    }
};

exports.deleteVehicle = async (req, res) =>{
    try{
        const vehicleId = req.params.id;
        
        await VehicleModel.deleteVehicle(vehicleId);
        res.redirect('/vehicles?success=Vehicle+deleted+successfully');
    }
    catch (error){
        console.error("Cannot delete vehicle:", error);
        res.redirect('/vehicles?error=Error+deleting+vehicle.');
    }
};