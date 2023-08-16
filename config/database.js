// Imporing the module 
const mongoose = require('mongoose');
//This is the params for  the database coonection just like headers 
const conParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
// This is the main function to connect to the database 
const connecToDb = () => {
    try {
        mongoose.connect(process.env.DB_URL, conParams).then((con) => {
            console.log(`Connected to the Database: ${con.connection.host}`)
        }
        ).catch((err) => {
            console.log(`Unable to connect to the database. ${err}`)
        })

    } catch (error) {
        console.log(`Unable to connect to the database. ${error}`)
    }
}
//exporting the connection function 
module.exports = connecToDb;