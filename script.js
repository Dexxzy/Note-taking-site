document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById('signup');
  const loginForm = document.getElementById('login');
  const authPage = document.getElementById('auth-page');
  const notePage = document.getElementById('note-page');
  const noteContent = document.getElementById('note-content');
  const saveNoteButton = document.getElementById('save-note');
  const noteList = document.getElementById('note-list');
  const logoutButton = document.getElementById('logout');
  const themeToggle = document.getElementById('theme-toggle');
  const searchInput = document.getElementById('search-notes');

  const NOTES_KEY_PREFIX = 'notes_';
  const MAX_NOTE_LENGTH = 500;
  let editingNoteId = null;

  function saveUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
  }

  function getUser(username) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[username];
  }

  function getStoredNotes(username) {
    return JSON.parse(localStorage.getItem(NOTES_KEY_PREFIX + username)) || [];
  }

  function saveNotes(username, notes) {
    localStorage.setItem(NOTES_KEY_PREFIX + username, JSON.stringify(notes));
  }

  function renderNotes(notes) {
    noteList.innerHTML = '';
    notes.forEach((note, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="note-content">${note}</span>
        <div class="note-actions">
          <button class="edit-note" data-id="${index}"><i class="fas fa-edit"></i> Edit</button>
          <button class="delete-note" data-id="${index}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `;
      noteList.appendChild(li);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-note').forEach(btn => {
      btn.addEventListener('click', editNote);
    });
    document.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', confirmDelete);
    });
  }

  function editNote(e) {
    const noteId = parseInt(e.target.closest('.edit-note').getAttribute('data-id'));
    const currentUser = localStorage.getItem('current_user');
    const notes = getStoredNotes(currentUser);
    noteContent.value = notes[noteId];
    editingNoteId = noteId;
    saveNoteButton.innerHTML = '<i class="fas fa-save"></i> Update Note';
    updateCharacterCount();
  }

  function confirmDelete(e) {
    const noteId = parseInt(e.target.closest('.delete-note').getAttribute('data-id'));
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  }

  function deleteNote(noteId) {
    const currentUser = localStorage.getItem('current_user');
    const notes = getStoredNotes(currentUser);
    notes.splice(noteId, 1);
    saveNotes(currentUser, notes);
    renderNotes(notes);
  }

  function updateCharacterCount() {
    const charCount = noteContent.value.length;
    const charCountElem = document.getElementById('char-count');
    charCountElem.textContent = `${charCount}/${MAX_NOTE_LENGTH}`;
    charCountElem.style.color = charCount > MAX_NOTE_LENGTH ? 'red' : '#666';
  }

  function searchNotes(query) {
    const currentUser = localStorage.getItem('current_user');
    const notes = getStoredNotes(currentUser);
    const filteredNotes = notes.filter(note => 
      note.toLowerCase().includes(query.toLowerCase())
    );
    renderNotes(filteredNotes);
  }

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    if (username && password) {
      if (getUser(username)) {
        alert('Username already exists.');
      } else {
        saveUser(username, password);
        alert('User registered successfully.');
      }
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (username && password) {
      const storedPassword = getUser(username);
      if (storedPassword === password) {
        localStorage.setItem('current_user', username);
        authPage.style.display = 'none';
        notePage.style.display = 'block';
        renderNotes(getStoredNotes(username));
      } else {
        alert('Invalid username or password.');
      }
    }
  });

  saveNoteButton.addEventListener('click', () => {
    const currentUser = localStorage.getItem('current_user');
    if (currentUser) {
      const notes = getStoredNotes(currentUser);
      const newNote = noteContent.value.trim();
      if (newNote && newNote.length <= MAX_NOTE_LENGTH) {
        if (editingNoteId !== null) {
          notes[editingNoteId] = newNote;
          editingNoteId = null;
          saveNoteButton.innerHTML = '<i class="fas fa-save"></i> Save Note';
        } else {
          notes.push(newNote);
        }
        saveNotes(currentUser, notes);
        renderNotes(notes);
        noteContent.value = '';
        updateCharacterCount();
      } else if (newNote.length > MAX_NOTE_LENGTH) {
        alert(`Note is too long. Maximum length is ${MAX_NOTE_LENGTH} characters.`);
      }
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('current_user');
    authPage.style.display = 'flex';
    notePage.style.display = 'none';
    noteContent.value = '';
    editingNoteId = null;
    saveNoteButton.innerHTML = '<i class="fas fa-save"></i> Save Note';
  });

  noteContent.addEventListener('input', updateCharacterCount);

  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
  });

  searchInput.addEventListener('input', (e) => {
    searchNotes(e.target.value);
  });

  // Check for saved theme preference
  if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;
  }

  const currentUser = localStorage.getItem('current_user');
  if (currentUser) {
    authPage.style.display = 'none';
    notePage.style.display = 'block';
    renderNotes(getStoredNotes(currentUser));
  }

  updateCharacterCount();
});