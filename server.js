

const express = require("express");
const db = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token is required"
        });
    }

    // jwt.verify(token, "mysecretkey", (err, user) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
}
// Home route
app.get("/", (req, res) => {
    res.send("Task API is running");
});

app.get("/tasks", authenticateToken, (req, res) => {
    db.all(
        "SELECT * FROM tasks WHERE userId = ?",
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(rows);
        }
    );
});

// Register user
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        function (err) {
            if (err) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            res.status(201).json({
                id: this.lastID,
                name: name,
                email: email
            });
        }
    );
});

// Login user
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const passwordMatch = bcrypt.compareSync(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            res.json({
                message: "Login successful",
                token: token
            });
        }
    );
});

app.post("/tasks", authenticateToken, (req, res) => {
    const title = req.body.title;
    const userId = req.user.id;

    // if (!title) {
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    db.run(
        "INSERT INTO tasks (title, userId) VALUES (?, ?)",
        [title, userId],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.status(201).json({
                id: this.lastID,
                title: title,
                completed: false,
                userId: userId
            });
        }
    );
});

// Get one task
app.get("/tasks/:id", authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);

    db.get(
        "SELECT * FROM tasks WHERE id = ? AND userId =?",
        [taskId, req.user.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (!row) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                id: row.id,
                title: row.title,
                completed: Boolean(row.completed),
                userId: row.userId
            });
        }
    );
});

// Update task
// app.put("/tasks/:id", authenticateToken, (req, res) => {
    // const title = req.body.title;
    // const completed = req.body.completed ? 1 : 0;

    // if (!title) {
    //     return res.status(400).json({
    //         message: "Title is required"
    //     });
    // }
    // const taskId = parseInt(req.params.id);
    // const title = req.body.title;
    // const completed = req.body.completed ? 1 : 0;

    // if (typeof req.body.completed !== "boolean") {
    //     return res.status(400).json({
    //         message: "Completed must be true or false"
    //     });
    // }


    // if (typeof title !== "string" || title.trim() === "") {
    //     return res.status(400).json({
    //         message: "Title is required"
    //     });
    // }

    app.put("/tasks/:id", authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const title = req.body.title;

    if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({
            message: "Completed must be true or false"
        });
    }

    const completed = req.body.completed ? 1 : 0;

    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    // yahan se tumhara existing db.run(...) wala code same rahega
    db.run(
        // "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
        "UPDATE tasks SET title = ?, completed = ? WHERE id = ? AND userId = ?",
        [title, completed, taskId, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            // res.json({
            //     id: taskId,
            //     title: title,
            //     completed: Boolean(completed)
            // });
            res.json({
                id: taskId,
                title: title,
                completed: Boolean(completed),
                userId: req.user.id
            });
        }
    );
});


// Delete task
app.delete("/tasks/:id", authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);

    db.run(
        "DELETE FROM tasks WHERE id = ? AND userId =?",
        [taskId, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                message: "Task deleted successfully"
            });
        }
    );
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});