const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs').promises;  // для асихроних операцій
const path = require('path');

const port = 8000;
const notesFilePath = path.join(__dirname, 'notes.json');
const staticFolderPath = path.join(__dirname, 'static');

//  для обробки JSON в запитах
app.use(express.json());
// В для обслуговування статичних файлів з папки 'static'
app.use(express.static(staticFolderPath));

let notes = [];

// GET /notes
app.get('/notes', (req, res) => {
  res.json(notes);
});

// GET /UploadForm.html
app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(staticFolderPath, 'UploadForm.html'));
});

// GET /notes/:note_name
app.get('/notes/:note_name', (req, res) => {
  // Отримую параметр із запиту
  const note_name = req.params.note_name;
  // Шукаю нотатку за іменем в масиві 'notes'
  const findnote = notes.find(note => note.note_name === note_name);

  if (findnote) {
    // Якщо знайдена, надсилаю JSON із інформацією про нотатку
    res.json({ note_name: note_name, note: findnote.note });
  } else {
    res.status(404).send('Note not found');
  }
});

// POST /upload
app.post('/upload', (req, res) => {
  // Отримую дані із тіла запиту
  const note_name = req.body.note_name;
  const note = req.body.note;

// Перевіряю, чи існує нотатка з таким іменем
  const existingNote = notes.find(note => note.note_name === note_name);

  if (existingNote) {
    res.status(400).send("Note already exists");
  } else {
     // Якщо нотатки не існує, додаю нову, зберігаю в файл і повертаю статус 201
    notes.push({ note_name: note_name, note: note });
    saveNotesToJson();
    res.status(201).send("Created");
  }
});

// PUT /notes/:note_name
app.put('/notes/:note_name', (req, res) => {
  // Отримую параметр із запиту
  const note_name = req.params.note_name;
  //оновлене значення нотатки із тіла запиту
  const updatedNote = req.body.note;

// Шукаю індекс нотатки в масиві 'notes' за ім'ям
  const noteIndex = notes.findIndex(note => note.note_name === note_name);

  if (noteIndex !== -1) {
    notes[noteIndex].note = updatedNote;
    saveNotesToJson();
    res.status(200).send('Updated');
  } else {
    res.status(404).send('Note not found');
  }
});

// DELETE /notes/:note_name
app.delete('/notes/:note_name', (req, res) => {
  const note_name = req.params.note_name;

  const noteIndex = notes.findIndex(note => note.note_name === note_name);

  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
    saveNotesToJson();
    res.status(200).send('Deleted');
  } else {
    res.status(404).send('Note not found');
  }
});

// Function to save notes to JSON file
async function saveNotesToJson() {
  try {
      // Асинхронно записую в файл JSON-представлення масиву 'notes'
    await fs.writeFile(notesFilePath, JSON.stringify(notes), 'utf8');
  } catch (error) {
    console.error('Error saving notes to JSON file:', error.message);
  }
}

app.listen(port, () => {
  console.log(`Server running: ${port}`);
});