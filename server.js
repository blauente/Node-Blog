const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
const userDb = require('./data/helpers/userDb');
const postDb = require('./data/helpers/postDb');

const server = express();

// Custom middleware to uppercase user's name
function upperCase(req, res, next) {
    req.upperName = req.body.name.toUpperCase();
    next();
}

server.use(express.json());
server.use(cors());
// server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({ extended: true }));
// server.use(upperCase());


// User endpoints
server.post('/users', upperCase, (req, res) => {
    const { name } = req.body;
    const upperName = req.upperName;
    if (!name) {
        res.status(400).json({errorMessage: 'Please provide a name for this user.'});
    } else {
        userDb.insert({name: upperName})
            .then(() => {
                res.status(201);
                res.json({upperName});
            })
            .catch(err => {
                res.status(500).json({error: 'There was an error while saving this user to the database.'});
            })
    }
})

server.get('/users', async (req, res) => {
    try {
        const response = await userDb.get();
        res.status(200).json(response);
    } catch (ex) {
        res.status(500).json({errorMessage: 'Error while getting the data.'});
    }
})

server.get('/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.getUserPosts(id)
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({errorMessage: 'There was an error getting this user\'s posts.'});
        })
})

server.put('/users/:id', upperCase, (req, res) => {
    const id = req.params.id;
    const { name } = req.body;
    const upperName = req.upperName;
    if (!name) {
        res.status(400).json({errorMessage: 'Please provide a new name for this user.'});
    } else {
        userDb.update(id, {name: upperName})
            .then(count => {
                if(count === 1) {
                    res.status(201).json(count);
                } else {
                    res.status(404).json({errorMessage: 'The user with the specified ID does not exist.'});
                }
            })
            .catch(err => {
                res.status(500).json({errorMessage: 'There was an error updating this user\'s info.'});
            })
    }
})

server.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.remove(id)
        .then(count => {
            if (count === 1) {
                res.status(204).end();
            } else {
                res.status(404).json({errosMessage: 'The user with the specified ID does not exist.'});
            }
        })
        .catch(err => {
            res.status(500).json({errorMessage: 'The user could not be removed.'});
        })
})


// Post endpoints

server.listen(6001, () => console.log('\n-=- Server listening on port 6001 -=-\n'));