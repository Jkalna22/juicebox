const express = require('express');
const postsRouter = express.Router();

const { requireUser } = require('./utils');
const { getPostById, updatePost, createPost } = require('../db');

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  authorId = req.user.id;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {authorId, title, content};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
  
    const post = await createPost(postData);
 
    if(post) {
      res.send({post})
    } else {
      next({ name, message });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next(); // THIS IS DIFFERENT
});
// NEW
const { getAllPosts } = require('../db');

postsRouter.get('/', async (req, res) => {
  try {
    const allPosts = await getAllPosts();

    const posts = allPosts.filter(post => {
      return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({
      posts
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// UPDATE
postsRouter.get('/', async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts
  });
});

module.exports = postsRouter;

// curl http://localhost:3000/api/posts -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2MTU1MTIwMTZ9.vowjD70Z-EII9i0-CEAzK2fdutEONqLVMUTO43sgZoo" -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'

// curl http://localhost:3000/api/posts -X POST -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2MTU1MTIwMTZ9.vowjD70Z-EII9i0-CEAzK2fdutEONqLVMUTO43sgZoo" -H 'Content-Type: application/json' -d '{"title": "I still do not like tags", "content": "CMON! why do people use them?"}'

// curl http://localhost:3000/api/posts/1 -X PATCH -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2MTU1MTIwMTZ9.vowjD70Z-EII9i0-CEAzK2fdutEONqLVMUTO43sgZoo" -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'

// curl http://localhost:3000/api/posts/1 -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2MTU1MTIwMTZ9.vowjD70Z-EII9i0-CEAzK2fdutEONqLVMUTO43sgZoo"

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsYmVydCIsImlhdCI6MTYxNTUxMTA3MX0.jrSUlsK8HW_d0-5uTPhOLoiwngYrfJpOKhHW0QLnAO0