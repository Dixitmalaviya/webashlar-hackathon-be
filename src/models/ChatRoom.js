import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    inputtext: { type: String },
    outputtext: { type: String },
    timestamp: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    summary: { type: String },
    conversation: [messageSchema],
    patientDetails: {
        name: String,
        pid: String,
        city: String,
        contact: String,
        problem: String
    },
    // blockchainHash: { type: String, unique: true },
    // sbtTokenId: { type: Number, unique: true }
}, { timestamps: true });

export default mongoose.model('ChatRoom', chatRoomSchema);
