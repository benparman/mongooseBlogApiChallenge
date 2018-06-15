'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());

//--------GET /posts
app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'there was a problem with your request'});
    });
});
//--------GET /posts/:id
app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'there was a problem with your request'});
    });
});
//--------POST /posts/
app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing '${field}' in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'there was a problem with your request'});
    });
});
//-------------PUT /posts/:id
app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({error: 'ID for both Request Path, and Request Body, must match!'});
  }
  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      update[field] = req.body[field];
    }
  })
  BlogPost
   .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
   .then(updatedPost => res.status(204).end())
   .catch(err => res.status(500).json({message: 'there was a problem with your request'}));
})
//-------------DELETE /posts/:id
app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({message: 'Blog post successfully removed'})
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'there was a problem with your request'});
    });
});
//-------------DELETE /:id
app.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted post (ID: ${req.params.id}).`);
      res.status(204).end();
    });
});
//-------------What does this do?
app.use('*', function(req, res) {
  res.status(204).json({message: 'Not Found'});
});
//-------------runServer & closeServer
let server; //declared globally so runServer can assign a value to it, and closeServer can access it

//----------connect to database
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      //----------start server
      server = app.listen(port, () => {
        console.log(`Your app is listening on ${port}`);
        resolve();
      })
      ////----------disconnect on error
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
};
//----------Close server and return promise for use in integration tests later on
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing Server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};
//----------This allows server.js to be called directly (ie node server.js, or nodemon server.js)
//----------But we export runServer so that test code can also start the server
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { runServer, app, closeServer };

// app.listen(process.env.PORT || 8080, () => {
//   console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
// });
