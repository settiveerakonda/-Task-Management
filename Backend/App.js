import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import TeamMember from './Models/TeamMember';
//  import Task from './Models/Task';
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use an environment variable for security
mongoose.connect('mongodb+srv://settiveerakonda:TNUqjKFkBy68GISg@cluster0.d007d.mongodb.net/team?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => app.listen(4000))
.then(() => console.log("Connected to database & listening on localhost:4000"))
.catch((err) => console.error("Database connection error:", err));



app.post('/register', async (req, res) => {
    const { UserName, Email, Password, Role } = req.body;

    try {
        const existingUser = await TeamMember.findOne({ Email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const teamMember = new TeamMember({
            UserName,
            Email,
            Password: hashedPassword,
            Role: Role || 'user' // If no role is provided, default to 'user'
        });

        await teamMember.save();
        return res.status(201).json({ message: 'Team member registered successfully' });
    } catch (err) {
        console.error('Error registering team member:', err);
        return res.status(500).json({ message: 'Error registering team member' });
    }
});

// Check if email already exists
app.post('/check-email', async (req, res) => {
    const { Email } = req.body;
    try {
        const user = await TeamMember.findOne({ Email });
        return res.status(200).json({ exists: !!user });
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const user = await TeamMember.findOne({ Email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.Role }, jwtSecret, { expiresIn: '1h' });
        return res.status(200).json({ token, role: user.Role }); // Return the role along with the token
    } catch (error) {
        console.error('Error during authentication:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Task Schema and Model
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, default: 'To Do' },
    priority: { type: String, default: 'Low' }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

// API Routes
// 1. POST route to create a new task
app.post('/task', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
});
// 2. GET route to fetch all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});
// Update
app.put('/api/task/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
});

// 4. DELETE route to remove a task by ID
app.delete('/api/task/:id', async (req, res) => {
    const taskId = req.params.id;
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.status(200).json({ message: 'Task deleted', deletedTask });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
});
