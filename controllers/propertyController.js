const propertyService = require('../services/propertyService');

// ── GET /properties ──────────────────────────────────────────────────────────
exports.getProperties = async (req, res) => {
    try {
        const [properties, residents] = await Promise.all([
            propertyService.getAllProperties(),
            propertyService.getAllResidents(),
        ]);

        res.render('property', {
            title:      'Properties',
            activePage: 'properties',
            pageCSS:    'property.css',
            properties,
            residents,
            success: req.query.success || null,
            error:   req.query.error   || null,
        });
    } catch (err) {
        console.error('getProperties error:', err);
        res.status(500).send('Failed to load properties.');
    }
};

// ── GET /properties/:id/residents  (JSON) ────────────────────────────────────
exports.getPropertyResidents = async (req, res) => {
    try {
        const residents = await propertyService.getPropertyResidents(req.params.id);
        res.json(residents);
    } catch (err) {
        console.error('getPropertyResidents error:', err);
        res.status(500).json({ error: 'Failed to load residents.' });
    }
};

// ── POST /properties ─────────────────────────────────────────────────────────
exports.createProperty = async (req, res) => {
    try {
        const { lot_number, property_type, street_name, resident_ids, resident_types } = req.body;

        const ids   = [].concat(resident_ids   || []);
        const types = [].concat(resident_types || []);

        await propertyService.createProperty({
            lot_number, property_type, street_name,
            resident_ids: ids, resident_types: types,
        });
        res.redirect('/properties?success=Property+added+successfully.');
    } catch (err) {
        console.error('createProperty error:', err);
        res.redirect('/properties?error=Failed+to+add+property.');
    }
};

// ── POST /properties/:id/update ──────────────────────────────────────────────
exports.updateProperty = async (req, res) => {
    try {
        const { lot_number, property_type, street_name, resident_ids, resident_types } = req.body;

        const ids   = [].concat(resident_ids   || []);
        const types = [].concat(resident_types || []);

        await propertyService.updateProperty({
            property_id: req.params.id,
            lot_number, property_type, street_name,
            resident_ids: ids, resident_types: types,
        });
        res.redirect('/properties?success=Property+updated+successfully.');
    } catch (err) {
        console.error('updateProperty error:', err);
        res.redirect('/properties?error=Failed+to+update+property.');
    }
};

// ── POST /properties/:id/delete ──────────────────────────────────────────────
exports.deleteProperty = async (req, res) => {
    try {
        await propertyService.deleteProperty(req.params.id);
        res.redirect('/properties?success=Property+deleted+successfully.');
    } catch (err) {
        console.error('deleteProperty error:', err);
        res.redirect('/properties?error=Failed+to+delete+property.');
    }
};
