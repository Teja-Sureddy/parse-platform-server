const SES = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
}

const USER_SCHEMA = {
    className: "_User",
    fields: {
        phone: { type: "Number", required: true },
        is_active: { type: "Boolean", default: true },
        birth_date: { type: "Date" },
        location: { type: "GeoPoint" }
    },
    indexes: {
        usernameIndex: { username: 1 },
        usernameAndEmailIndex: { username: 1, email: 1 }
    },
    classLevelPermissions: {
        find: { requiresAuthentication: true }, // all
        count: { requiresAuthentication: true },
        get: { requiresAuthentication: true }, // id
        create: { "*": true },
        update: { "role:admin": true },
        delete: { "role:admin": true },
        protectedFields: {
            "*": ["authData", "emailVerified", "password", "username"],
            "role:admin": ["authData", "emailVerified", "password"]
        }
    },
}

const LIVE_SCHEMA = {
    className: "Live",
    fields: {
        string_col: { type: "String", required: true },
        number_col: { type: "Number", required: true },
        boolean_col: { type: "Boolean", default: true },
        date_col: { type: "Date" },
        geoPoint_col: { type: "GeoPoint" },
        polygon_col: { type: "Polygon" },
        file_col: { type: "File" },
        array_col: { type: "Array" },
        object_col: { type: "Object" },
        pointer_col: { type: "Pointer", targetClass: "_User" },
        relation_col: { type: "Relation", targetClass: "_User" },
    },
    indexes: {
        pointerColIndex: { _p_pointer_col: 1 },
        relationColIndex: { relation_col: 1 }
    },
    classLevelPermissions: {
        find: { "*": true },
        count: { "*": true },
        get: { "*": true },
        create: { "*": true },
        update: { "*": true },
        delete: { "*": true }
    },
}

const APP_NAME = "Application1"
const LIVE_QUERY_CLASSES = ["Live"]

module.exports.SES = SES
module.exports.USER_SCHEMA = USER_SCHEMA
module.exports.LIVE_SCHEMA = LIVE_SCHEMA
module.exports.APP_NAME = APP_NAME
module.exports.LIVE_QUERY_CLASSES = LIVE_QUERY_CLASSES