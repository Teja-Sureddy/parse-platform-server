const SES = {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
    region: process.env.AWS_REGION
}

const PERMISSIONS = {
    "class_name": {
        get: { "*": true }, // id
        find: { "*": false, "requiresAuthentication": true }, // all
        create: { "*": false, "role:admin": true },
        update: { "*": false, "role:admin": true },
        delete: { "*": false, "role:admin": true },
        addField: { "*": false, "role:admin": true },
    },
}

const USER_SCHEMA = {
    className: "_User",
    fields: {
        first_name: { type: "String", required: true },
        phone: { type: "Number", required: true },
        is_active: { type: "Boolean", default: true },
        birth_date: { type: "Date" },
        location: { type: "GeoPoint" },
        zone: { type: "Polygon" },
        picture: { type: "File" },
        tags: { type: "Array" },
        metadata: { type: "Object" },
        city: { type: "Pointer", targetClass: "City" },
        friends: { type: "Relation", targetClass: "_User" },
    },
    indexes: {
        birthdateIndex: { birth_date: 1 },
        nameAndPhoneIndex: { first_name: 1, phone: 1 },
        // The special prefix _p_ is used to create indexes on pointer fields
        cityPointerIndex: { _p_city: 1 },
        friendsIndex: { friends: 1 }
    },
    classLevelPermissions: {
        find: { requiresAuthentication: true },
        count: { requiresAuthentication: true },
        get: { requiresAuthentication: true },
        create: { "role:Admin": true },
        update: { "role:Admin": true },
        delete: { "role:Admin": true },
        protectedFields: {
            // These fields will be protected from all other users. AuthData and password are already protected by default
            "*": ["authData", "emailVerified", "password", "username"],
        }
    },
}


const APP_NAME = "Application1"
const LIVE_QUERY_CLASSES = ["class_name"]

module.exports.SES = SES
module.exports.PERMISSIONS = PERMISSIONS
module.exports.USER_SCHEMA = USER_SCHEMA
module.exports.APP_NAME = APP_NAME
module.exports.LIVE_QUERY_CLASSES = LIVE_QUERY_CLASSES