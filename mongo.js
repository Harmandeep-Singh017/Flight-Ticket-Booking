require('dotenv').config();
const mongoose = require("mongoose")
//const url = "mongodb://localhost:27017/LoginFormPractice";

mongoose.set('strictQuery', false);
const connectDB = async ()=> {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

const logInSchema = new mongoose.Schema({
    name: String,
    password: String, 
    role: String
});

const flightListSchema = new mongoose.Schema({
    airline: String,
    source: String,
    destination: String,
    flightNumber: Number,
    departure: String,
    arrival: String,
    seats: {
        type: Number,
        default: 60,
    }
});

const bookSchema = new mongoose.Schema({
    source: String,
    destination: String,
    flightNumber: Number,
    departure: String,
    arrival: String,
    seatCount: {
        type: Number,
    },
    contact: Number
});


const LogInCollection = new mongoose.model('Login',logInSchema, 'LogInCollection')
const FlightList = new mongoose.model('flightList',flightListSchema, 'FlightList')
const bookedList = new mongoose.model('bookingList',bookSchema, 'bookedList')

module.exports = {
    connectDB: connectDB,
    FlightList: FlightList,
    LogInCollection: LogInCollection,
    bookedList: bookedList
}
