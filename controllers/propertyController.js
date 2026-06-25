const propertyModel = require('../models/propertyModel');

// ── GET /properties ──────────────────────────────────────────────────────────
exports.getProperties = async (req, res) => {
    try {
        const [properties, residents] = await Promise.all([
            propertyModel.getAllProperties(),
            propertyModel.getAllResidents(),
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

// ── POST /properties ─────────────────────────────────────────────────────────
exports.createProperty = async (req, res) => {
    try {
        const { property_type, street_name, owner_resident_id } = req.body;
        await propertyModel.createProperty({
            property_type,
            street_name,
            owner_resident_id: owner_resident_id || null,
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
        const { property_type, street_name, owner_resident_id } = req.body;
        await propertyModel.updateProperty({
            property_id:       req.params.id,
            property_type,
            street_name,
            owner_resident_id: owner_resident_id || null,
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
        await propertyModel.deleteProperty(req.params.id);
        res.redirect('/properties?success=Property+deleted+successfully.');
    } catch (err) {
        console.error('deleteProperty error:', err);
        res.redirect('/properties?error=Failed+to+delete+property.');
    }
};
