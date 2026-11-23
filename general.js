const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registred. Now you can login" });
});

// Get the book list available in the shop using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    return res.status(200).json({ books: response.data });
  } catch (error) {
    return res.status(200).json({ books });
  }
});

// Helper route serving raw booksdb object for internal Axios requests
public_users.get('/books-data', function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const { isbn } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data || books;
    if (allBooks[isbn]) {
      return res.status(200).json(allBooks[isbn]);
    }
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  } catch (error) {
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    }
    return res.status(500).json({ message: "Error retrieving book by ISBN." });
  }
});

// Get book details based on author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data || books;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({
          isbn,
          title: allBooks[isbn].title,
          reviews: allBooks[isbn].reviews,
        });
      }
    });

    return res.status(200).json({ booksbyauthor: matchingBooks });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author." });
  }
});

// Get all books based on title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/books-data`);
    const allBooks = response.data || books;
    const matchingBooks = [];

    Object.keys(allBooks).forEach((isbn) => {
      if (allBooks[isbn].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push({
          isbn,
          author: allBooks[isbn].author,
          reviews: allBooks[isbn].reviews,
        });
      }
    });

    return res.status(200).json({ booksbytitle: matchingBooks });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title." });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found." });
});

module.exports.general = public_users;
