const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors(
    {
        origin: 'https://schema-ref-client-side.vercel.app', 
        methods: ['GET', 'POST'], 
        allowedHeaders: ['Content-Type'], 
      }
));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://schema-ref-client-side.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/myDatabase', {
    useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  const { Schema, model } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const User = model('User', UserSchema);
const Post = model('Post', PostSchema);


  const port = 5000;
  app.listen(port, () => console.log(`Server is running on port ${port}`));

  // Add a new user
  app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = new User({ name, email });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  // Add a new post
  app.post('/posts', async (req, res) => {
    try {
        const { title, content, userId } = req.body;
        const post = new Post({ title, content, user: userId });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  });

  app.get('/', (req, res) => {
    res.send("Server is running");
  })

  // Retrieve all posts with user data
  app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().populate('user', 'name email');
        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  })