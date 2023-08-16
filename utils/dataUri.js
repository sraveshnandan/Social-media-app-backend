const DataURIParser = require('datauri/parser.js');
const path = require('path');
const getDataUri = (file) => {
    const parser = new DataURIParser();
    const ExtName = path.extname(file.originalname).toString();
    return parser.format(ExtName, file.buffer)

}
module.exports = getDataUri;

