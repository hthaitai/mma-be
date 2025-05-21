const express = require('express');
const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connnected to MongoDB');
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
    }
}

module.exports = { connect };