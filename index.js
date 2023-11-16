const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const upload = multer();
const port = 8000;
const notesFilePath = path.join(__dirname, 'notes.json');
const staticFolderPath = path.join(__dirname, 'static');

app.use(express.json());
app.use(express.static(staticFolderPath));

let notes = [];

app.get('/notes', async (req, res) => {
  try {
    const data = await fs.readFile(notesFilePath, 'utf-8');
    notes = JSON.parse(data);
    
    // Check if the notes array is empty
    if (notes.length === 0) {
      res.json([]);
    } else {
      res.json(notes);
    }
  } catch (error) {
    console.error('Error reading notes from JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(staticFolderPath, 'UploadForm.html'));
});

app.get('/notes/:note_name', async (req, res) => {
  try {
    const data = await fs.readFile(notesFilePath, 'utf-8');
    const getnotes = JSON.parse(data);
    const noteName = req.params.note_name;
    const note = getnotes.find((note) => note.note_name === noteName);
    if (note) {
      res.json({ note_name: note.note_name, note: note.note });
    } else {
      res.status(404).send('Note not found');
    }
  } catch (error) {
    console.error('Error reading notes from JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/upload', upload.none(), async (req, res) => {
  try {
    const data = await fs.readFile(notesFilePath, 'utf-8');
    notes = JSON.parse(data);
    const noteName = req.body.note_name;
    const noteText = req.body.note;

    const existingNote = notes.find((note) => note.note_name === noteName);

    if (existingNote) {
      return res.status(400).json({ error: 'Note with this name already exists' });
    }

    notes.push({ note_name: noteName, note: noteText });
    await saveNotesToJson();
    res.status(201).send('Created');
  } catch (error) {
    console.error('Error reading notes from JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/notes/:note_name', express.text(), async (req, res) => {
  const noteName = req.params.note_name;
  const newNoteText = req.body;

  if (!noteName.trim()) {
    return res.status(400).send('Please enter the note name.');
  }

  try {
    let data = await fs.readFile(notesFilePath, 'utf-8');
    let notes = JSON.parse(data);

    const noteIndex = notes.findIndex((note) => note.note_name === noteName);

    if (noteIndex !== -1) {
      notes[noteIndex].note = newNoteText;

      await fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), 'utf8');
      res.send('Note updated successfully.');
    } else {
      res.status(404).send('Note not found.');
    }
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Internal Server Error.');
  }
});


app.delete('/notes/:note_name', async (req, res) => {
  try {
    const noteName = req.params.note_name;
    const data = await fs.readFile(notesFilePath, 'utf-8');
    notes = JSON.parse(data);

    const noteIndex = notes.findIndex((note) => note.note_name === noteName);

    if (noteIndex !== -1) {
      notes.splice(noteIndex, 1);
      await saveNotesToJson();
      res.status(200).send('Deleted');
    } else {
      res.status(404).send('Note not found');
    }
  } catch (error) {
    console.error('Error reading notes from JSON file:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

async function saveNotesToJson() {
  const dataJSON = JSON.stringify(notes,null, 2);
  await fs.writeFile(notesFilePath, dataJSON, 'utf8');
}

app.listen(port, () => {
  console.log(`Server running: ${port}`);
});
