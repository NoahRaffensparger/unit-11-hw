const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3001;
const { readFromFile, readAndAppend } = require('./helpers/fsUtils');
const uuid = require('./helpers/uuid');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
  );

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
  )

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);

  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to submit feedback`);

  const { title, text } = req.body;

  if (title && text ) {

    const newNote = {
      title,
      text,
      id: uuid(),
    };

    readAndAppend(newNote, './db/db.json');

    const response = {
      status: 'success',
      body: newNote,
    };

    res.json(response);
  } else {
    res.json('Error in posting feedback');
  }
});

app.delete('/api/notes/:id', (req, res) => {

  const noteId = req.params.id;
  const filePath = path.join(__dirname, 'db.json');

  // Read the current notes from the file
  readFromFile(filePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading the file');
      }

      let notes = JSON.parse(data);
      // Filter out the note with the matching ID
      notes = notes.filter(note => note.id !== noteId);

      // Write the updated notes back to the file
      readAndAppend(filePath, JSON.stringify(notes, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error writing to the file');
          }
          res.status(200).send('Note deleted successfully');
      });
  });
});

app.listen(PORT, () => 
console.log (`App listening at http://localhost:${PORT}`)
);