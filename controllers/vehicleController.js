const VehicleModel = require('../models/vehicleModel');

exports.getVehicles = async (req, res) => {
    try{
        const vehicles = await VehicleModel.getAllVehicles();
        const residents = await VehicleModel.getAllResidents();

        console.log("Fetched Residents from DB:", residents);

        res.render('vehicles', {
            title: 'Vehicles',
            activePage: 'vehicles',
            pageCSS: 'vehicles.css',
            vehicles: vehicles,
            residents: residents
        });
    }
    catch (error){
        console.error("Cannot fetch vehicles:", error);
        res.status(500).send("Server Error loading vehicles.");
    }
};

exports.registerVehicle = async (req, res) => {

    // cleaning
    const plate_number = req.body.plate_number ? req.body.plate_number.trim().toUpperCase() : '';
    const type = req.body.type ? req.body.type.trim() : '';
    const make = req.body.make ? req.body.make.trim() : '';
    const model = req.body.model ? req.body.model.trim() : '';
    const color = req.body.color ? req.body.color.trim() : '';
    const sticker_year = req.body.sticker_year || null;
    const resident_id = req.body.resident_id;
    
    if (!plate_number){
        return res.status(400).send("Plate number is required.");
    }

    if (!type || !plate_number || !make || !model || !color || !resident_id) {
        return res.status(400).send("Type, Plate number, Make, Model, Color, and Resident are required.");
    }

    try{
        const existing = await VehicleModel.findByPlate(plate_number);
        if (existing.length > 0){
            return res.status(400).send("Plate number is already registered in the system.");
        }

        const newVehicleId = await VehicleModel.createVehicle({
            type, plate_number, make, model, color, sticker_year
        });
        
        if (resident_id){
            await VehicleModel.linkToResident(resident_id, newVehicleId);
        }

        res.redirect('/vehicles');
    }
    catch (error){
        console.error("Cannot save vehicle:", error);
        res.status(500).send("Error saving vehicle.");
    }
};

exports.updateVehicle = async (req, res) => {
    const vehicleId = req.params.id;
    
    // cleaning
    const type = req.body.type ? req.body.type.trim() : '';
    const plate_number = req.body.plate_number ? req.body.plate_number.trim().toUpperCase() : '';
    const make = req.body.make ? req.body.make.trim() : '';
    const model = req.body.model ? req.body.model.trim() : '';
    const color = req.body.color ? req.body.color.trim() : '';
    const sticker_year = req.body.sticker_year || null;
    const resident_id = req.body.resident_id || null;
    
    if (!type || !plate_number || !make || !model || !color) {
        return res.status(400).send("Type, Plate Number, Make, Model, and Color are required.");
    }

    try{
        const existing = await VehicleModel.findByPlate(plate_number);

        if (existing.length > 0 && existing[0].vehicle_id != vehicleId) {
            return res.status(400).send("That plate number is already registered to another vehicle.");
        }

        await VehicleModel.updateVehicleData(vehicleId, type, plate_number, make, model, color, sticker_year);
        
        await VehicleModel.updateVehicleResident(vehicleId, resident_id);

        res.redirect('/vehicles');
    }
    catch (error) {
        console.error("Cannot update vehicle details:", error);
        res.status(500).send("Error updating vehicle.");
    }
};

exports.deleteVehicle = async (req, res) => {
    try{
        const vehicleId = req.params.id;
        
        await VehicleModel.softDeleteVehicle(vehicleId);

        res.redirect('/vehicles');
    }
    catch (error){
        console.error("Cannot delete vehicle:", error);
        res.status(500).send("Error deleting vehicle.");
    }
};