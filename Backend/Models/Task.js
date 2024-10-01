import mongoose from "mongoose";
const Schema = mongoose.Schema;
const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    assignedUser: { type: String, required: true }
});

// Create Task model
export default mongoose.model('Task', taskSchema);