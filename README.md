# Task Management REST API

A simple REST API built with Node.js and Express for managing tasks with user authentication and authorization.

Users can register and log in securely, create tasks, view their own tasks, update them, and delete them.

## Features

- User registration
- Secure password hashing using bcrypt
- User login
- JWT-based authentication
- Protected task routes
- User-specific task access
- Create, Read, Update and Delete tasks
- Input validation
- SQLite database
- Proper HTTP status codes
- Postman API testing

## Technologies Used

- Node.js
- Express.js
- SQLite
- bcryptjs
- JSON Web Token (JWT)
- dotenv
- Postman

## Project Structure

```text
task-api/
│
├── server.js
├── database.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── database.db
└── postman/