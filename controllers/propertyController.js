// PROPERTY CONTROLLER
// SPRINT 2+: connect all functions to the database via models.

exports.getProperties = (req, res) => {
    // TODO (SPRINT 2+): QUERY Property TABLE FROM DB
    const properties = [];

    res.render('property', {
        title:      'Properties',
        activePage: 'properties',
        pageCSS:    'property.css',
        properties,
    });
};

exports.createProperty = (req, res) => {
    // TODO (SPRINT 2+): INSERT INTO Property TABLE
};

exports.updateProperty = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Property TABLE WHERE property_id = req.params.id
};

exports.deleteProperty = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Property TABLE WHERE property_id = req.params.id
};
