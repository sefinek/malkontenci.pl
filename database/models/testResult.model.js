const { Schema, model } = require('mongoose');

const TestResultSchema = new Schema({
	score: { type: Number, required: true, min: 0, max: 100 },
	archetype: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

TestResultSchema.index({ createdAt: -1 });

module.exports = model('TestResult', TestResultSchema);
