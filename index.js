const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Usermodel = require('./models/User'); 
const adminData = require('./Admin.json'); 
const Bookmodel = require('./models/Book');
const Borrowmodel = require('./models/Borrow')
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
require('./dbconnection')

app.post('/signup', (req, res) => {
    const { name, email, password, phoneno } = req.body;

    if (!name || !email || !password || !phoneno) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    bcrypt.hash(password, 10)
        .then(hash => {
            Usermodel.create({ name, email, password: hash, phoneno })
                .then(() => res.status(201).json('User created'))
                .catch(err => res.status(500).json({ error: 'Error creating user', details: err }));
        })
        .catch(err => res.status(500).json({ error: 'Error hashing password', details: err }));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    Usermodel.findOne({ email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        const token = jwt.sign({ email: user.email, role: user.role }, "jwt-secret-key", { expiresIn: '1d' });
                        res.cookie('token', token, { httpOnly: true });
                        return res.json({ message: 'Logged in successfully' });
                    } else {
                        return res.status(400).json({ error: 'Invalid credentials' });
                    }
                });
            } else {
                return res.status(400).json({ error: 'User not found' });
            }
        })
        .catch(err => res.status(500).json({ error: 'Error finding user', details: err }));
});

app.post('/admin', (req, res) => {
    const { email, password } = req.body;

    const admin = adminData.find(admin => admin.email === email);
    if (!admin || admin.password !== password) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: admin.email, role: 'admin' }, "jwt-secret-key", { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Admin logged in successfully', token });
});


app.get("/viewuser", (req, res) => {
    Usermodel.find({})
    .then((users) => res.json(users))
    .catch((err) => res.status(500).json({ error: 'Error fetching users', details: err }));
});

app.get('/user/:id', (req, res) => {
    const { id } = req.params;

    Usermodel.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        })
        .catch((err) => {
            console.error('Error fetching user details:', err);
            res.status(500).json({ error: 'Error fetching user details', details: err });
        });
});

// PUT update user details by ID
app.put('/updateuser/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phoneno } = req.body;

    if (!name || !email || !phoneno) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    Usermodel.findByIdAndUpdate(id, { name, email, phoneno }, { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated successfully', user: updatedUser });
        })
        .catch((err) => {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Error updating user', details: err });
        });
});



app.delete('/deleteuser/:id', (req, res) => {
    const { id } = req.params;
  
    Usermodel.findByIdAndDelete(id)
      .then((deletedUser) => {
        if (!deletedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
      })
      .catch((err) => res.status(500).json({ error: 'Error deleting user', details: err }));
  });
  

app.post('/addbook', (req, res) => {
    const { booktitle, author, genre, year, url } = req.body;

    if (!booktitle || !author || !genre || !year || !url) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    Bookmodel.create({ booktitle, author, genre, year, url })
        .then(() => res.status(201).json('Book added'))
        .catch(err => res.status(500).json({ error: 'Error adding book', details: err }));
});
app.get("/viewbook", (req, res) => {
    Bookmodel.find({})
    .then((book) => res.json(book))
    .catch((err) => res.status(500).json({ error: 'Error fetching users', details: err }));
});

app.delete('/deletebook/:id', (req, res) => {
    const { id } = req.params;
  
    Bookmodel.findByIdAndDelete(id)
      .then((deletedUser) => {
        if (!deletedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Book deleted successfully' });
      })
      .catch((err) => res.status(500).json({ error: 'Error deleting user', details: err }));
  });

  app.put('/updatebook/:id', (req, res) => {
    const { id } = req.params;
    const { booktitle, author, genre, year } = req.body;

    if (!booktitle || !author || !genre || !year) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    Bookmodel.findByIdAndUpdate(id, { booktitle, author, genre, year }, { new: true })
        .then((updatedBook) => {
            if (!updatedBook) {
                return res.status(404).json({ error: 'Book not found' });
            }
            res.json({ message: 'Book updated successfully', book: updatedBook });
        })
        .catch((err) => res.status(500).json({ error: 'Error updating book', details: err }));
});
app.post('/borrowbook/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Bookmodel.findById(id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book borrowed successfully', book });
    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).json({ error: 'Error borrowing book' });
    }
});
app.get('/viewbook/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Bookmodel.findById(id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (err) {
        console.error('Error fetching book details:', err);
        res.status(500).json({ error: 'Error fetching book details' });
    }
});

// Correct endpoint for borrowing a book without ID parameter
app.post('/borrowbook', (req, res) => {
    const { booktitle, author} = req.body;

    Borrowmodel.create({ booktitle, author})
        .then(() => res.status(201).json('Book added'))
        .catch(err => res.status(500).json({ error: 'Error adding book', details: err }));
});

app.get('/viewborrowedbook', async (req, res) => {
    try {
        const borrowedBooks = await Borrowmodel.find();
        res.json(borrowedBooks);
    } catch (err) {
        console.error('Error fetching borrowed books:', err);
        res.status(500).json({ error: 'Error fetching borrowed books' });
    }
});
app.delete('/returnbook/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBook = await Borrowmodel.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book returned successfully', deletedBook });
    } catch (err) {
        console.error('Error returning book:', err);
        res.status(500).json({ error: 'Error returning book' });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
