exports.ok = (res, data) => res.json(data);
exports.created = (res, data) => res.status(201).json(data);
exports.err = (res, status, message) => res.status(status).json({ message });
