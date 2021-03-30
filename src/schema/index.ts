import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
  trackId: String,
  trackName: String,
});

const scrobSchema = new mongoose.Schema({
  dateId: Date,
});
