const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected To Database'));
    } catch (error) {
        console.log('Error Occured while connecting to database : ', error);
    }
}

module.exports =  connectDatabase;