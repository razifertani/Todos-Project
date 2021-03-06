const mongoose = require('mongoose');
const Todo = require('../models/todo');


exports.getAllTodos = (req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.currentpage;
    let todoQuery;
    let fetchedTodos;

    if (req.query.userId) {
        todoQuery = Todo.find({ creator: req.query.userId });
    } else {
        todoQuery = Todo.find();
    }

    if (pageSize && currentPage) {
        todoQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    todoQuery.then((data) => {
        fetchedTodos = data;
        return Todo.countDocuments({ creator: req.query.userId });
    })
        .then((count) => {
            res.status(200).json({
                success: true,
                todosLength: count,
                todos: fetchedTodos,
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: 'Server failure !',
            });
        });
};


exports.findById = (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        Todo.findById(req.params.id)
            .then(todo => {
                if (todo) {
                    res.status(200).json(todo);
                } else {
                    res.status(404).json({ message: "Post not found !" });
                }
            })
            .catch(error => {
                res.status(500).json({
                    success: false,
                    message: 'Server failure !',
                });
            });
    } else {
        res.status(404).json({ message: "Post not found !" });
    }

};


exports.createTodo = (req, res, next) => {
    const todo = new Todo({
        creator: req.userData.userId,
        title: req.body.title,
        content: req.body.content,
    });

    todo.save()
        .then((result) => {
            res.status(201).json({
                success: true,
                message: 'Post added successfully !',
                todo: {
                    id: result._id,
                    ...result,
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: 'Server failure !',
            });
        });
};


exports.deleteTodo = (req, res, next) => {
    Todo.deleteOne({
        _id: req.params.id,
        creator: req.userData.userId,
    })
        .then((result) => {
            if (result.n > 0) {
                res.status(200).json({
                    success: 'true',
                });
            } else {
                res.status(401).json({
                    success: 'false',
                    message: 'Not authorized !',
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                success: false,
                message: 'Server failure !',
            });
        })
};

