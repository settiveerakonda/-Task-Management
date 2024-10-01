import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TeamMemberSchema = new Schema({
    // User data
    UserName: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Role: {
        type: String,
        enum: ['user', 'admin'], // Role can be 'user' or 'admin'
        default: 'user' // Default role is 'user'
    }
});

export default mongoose.model('TeamMember', TeamMemberSchema);
