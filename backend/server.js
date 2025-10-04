const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// OBLIGATOIRE: Trust proxy pour Caddy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "LoveTasks",
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  assignedTo: {
    type: String,
    enum: ['person1', 'person2', 'both'],
    default: 'both',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedBy: String,
  points: {
    type: Number,
    default: 1,
  },
  dueDate: Date,
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'weekly',
  },
  category: {
    type: String,
    enum: ['cleaning', 'cooking', 'shopping', 'maintenance', 'other'],
    default: 'other',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model('Task', taskSchema);

// User Schema for gamification
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  identifier: {
    type: String,
    enum: ['person1', 'person2'],
    required: true,
    unique: true,
  },
  email: String,
  password: String, // In production, use bcrypt to hash passwords
  totalPoints: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  avatar: {
    type: String,
    default: '👤',
  },
  badges: [{
    type: String,
  }],
  streak: {
    type: Number,
    default: 0,
  },
  lastCompletedDate: Date,
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  fromUser: {
    type: String,
    required: true,
  },
  toUser: {
    type: String,
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  type: {
    type: String,
    enum: ['appreciation', 'encouragement', 'celebration', 'reminder'],
    required: true,
  },
  message: String,
  emoji: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// Achievement/Badge Schema
const achievementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  emoji: String,
  requirement: {
    type: String,
    required: true,
  },
  threshold: Number,
});

const Achievement = mongoose.model('Achievement', achievementSchema);

// Helper function to check and award badges
async function checkAndAwardBadges(user) {
  const newBadges = [];

  // First Task Badge
  if (user.tasksCompleted === 1 && !user.badges.includes('first_task')) {
    user.badges.push('first_task');
    newBadges.push('first_task');
  }

  // Tasker badges
  if (user.tasksCompleted >= 10 && !user.badges.includes('tasker_10')) {
    user.badges.push('tasker_10');
    newBadges.push('tasker_10');
  }
  if (user.tasksCompleted >= 50 && !user.badges.includes('tasker_50')) {
    user.badges.push('tasker_50');
    newBadges.push('tasker_50');
  }
  if (user.tasksCompleted >= 100 && !user.badges.includes('tasker_100')) {
    user.badges.push('tasker_100');
    newBadges.push('tasker_100');
  }

  // Streak badges
  if (user.streak >= 3 && !user.badges.includes('streak_3')) {
    user.badges.push('streak_3');
    newBadges.push('streak_3');
  }
  if (user.streak >= 7 && !user.badges.includes('streak_7')) {
    user.badges.push('streak_7');
    newBadges.push('streak_7');
  }
  if (user.streak >= 30 && !user.badges.includes('streak_30')) {
    user.badges.push('streak_30');
    newBadges.push('streak_30');
  }

  // Level badges
  if (user.level >= 5 && !user.badges.includes('level_5')) {
    user.badges.push('level_5');
    newBadges.push('level_5');
  }
  if (user.level >= 10 && !user.badges.includes('level_10')) {
    user.badges.push('level_10');
    newBadges.push('level_10');
  }

  return newBadges;
}

// Routes

// Health check
app.get('/LoveTasks/health', (req, res) => {
  res.json({ status: 'ok', message: 'LoveTasks API is running' });
});

// Get all tasks
app.get('/LoveTasks/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new task
app.post('/LoveTasks/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task (toggle completion)
app.put('/LoveTasks/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    Object.keys(req.body).forEach(key => {
      task[key] = req.body[key];
    });

    // If task is completed and has a completedBy, award points
    if (req.body.completed && req.body.completedBy) {
      const user = await User.findOne({ identifier: req.body.completedBy });
      if (user) {
        user.totalPoints += task.points || 1;
        user.tasksCompleted += 1;
        user.level = Math.floor(user.totalPoints / 10) + 1;

        // Update streak
        const today = new Date().setHours(0, 0, 0, 0);
        const lastCompleted = user.lastCompletedDate ? new Date(user.lastCompletedDate).setHours(0, 0, 0, 0) : null;

        if (lastCompleted) {
          const daysDiff = Math.floor((today - lastCompleted) / (1000 * 60 * 60 * 24));
          if (daysDiff === 1) {
            user.streak += 1;
          } else if (daysDiff > 1) {
            user.streak = 1;
          }
        } else {
          user.streak = 1;
        }

        user.lastCompletedDate = new Date();

        // Check and award badges
        await checkAndAwardBadges(user);

        await user.save();
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
app.delete('/LoveTasks/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
app.get('/LoveTasks/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update user
app.post('/LoveTasks/users', async (req, res) => {
  try {
    const existingUser = await User.findOne({ identifier: req.body.identifier });
    if (existingUser) {
      Object.keys(req.body).forEach(key => {
        existingUser[key] = req.body[key];
      });
      const updatedUser = await existingUser.save();
      res.json(updatedUser);
    } else {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get leaderboard
app.get('/LoveTasks/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
app.put('/LoveTasks/users/:identifier', async (req, res) => {
  try {
    const user = await User.findOne({ identifier: req.params.identifier });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'identifier') { // Don't allow changing identifier
        user[key] = req.body[key];
      }
    });

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Feedback routes
app.get('/LoveTasks/feedback/:userId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ toUser: req.params.userId })
      .populate('taskId')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/LoveTasks/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const newFeedback = await feedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/LoveTasks/feedback/:id/read', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    feedback.read = true;
    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get unread feedback count
app.get('/LoveTasks/feedback/:userId/unread-count', async (req, res) => {
  try {
    const count = await Feedback.countDocuments({
      toUser: req.params.userId,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stats endpoint
app.get('/LoveTasks/stats/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ identifier: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const completedTasks = await Task.find({
      completedBy: req.params.userId,
      completed: true
    });

    const categoriesStats = await Task.aggregate([
      { $match: { completedBy: req.params.userId, completed: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const weeklyTasks = await Task.countDocuments({
      completedBy: req.params.userId,
      completed: true,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      user,
      totalTasks: completedTasks.length,
      categoriesStats,
      weeklyTasks,
      badges: user.badges,
      streak: user.streak,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get badge definitions
app.get('/LoveTasks/badges', async (req, res) => {
  const badges = [
    { code: 'first_task', name: 'Premier Pas', emoji: '🎯', description: 'Compléter sa première tâche' },
    { code: 'tasker_10', name: 'Contributeur', emoji: '⭐', description: 'Compléter 10 tâches' },
    { code: 'tasker_50', name: 'Expert', emoji: '🏆', description: 'Compléter 50 tâches' },
    { code: 'tasker_100', name: 'Légende', emoji: '👑', description: 'Compléter 100 tâches' },
    { code: 'streak_3', name: 'Série de 3', emoji: '🔥', description: '3 jours consécutifs' },
    { code: 'streak_7', name: 'Série de 7', emoji: '💪', description: '7 jours consécutifs' },
    { code: 'streak_30', name: 'Série de 30', emoji: '🚀', description: '30 jours consécutifs' },
    { code: 'level_5', name: 'Niveau 5', emoji: '🌟', description: 'Atteindre le niveau 5' },
    { code: 'level_10', name: 'Niveau 10', emoji: '💎', description: 'Atteindre le niveau 10' },
  ];
  res.json(badges);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API accessible at http://localhost:${PORT}/LoveTasks`);
});
