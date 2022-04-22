const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(user => {if(username === user.username) return user})
  if(!user){
    response.json({error:"usuario nao encontrado"}).send(404)
  }
  request.user = user
  next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body
  if(!name || !username){
    throw new Error()
  }
  const userWithSameUsername = users.find(user => {if(username === user.username) return user})
  if(userWithSameUsername){
    response.status(400).json({error:"error"}).send()
  }
  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: [] 
  }
  users.push(user)
  response.json(user).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  response.json(user.todos).send(200)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {deadline, title} = request.body
  const {user} = request
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  response.status(201).json(todo).send()
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {deadline, title} = request.body
  const {id} = request.params
  let todo = user.todos.find(todo => {if(todo.id === id) return todo})
  if(!todo){
    response.status(404).json({error:"Todo nao encontrado"})
  }
  todo.deadline = deadline
  todo.title = title
  response.json(todo).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  let todo = user.todos.find(todo => {if(todo.id === id) return todo})
  if(!todo){
    response.status(404).json({error:"todo nao encontrado"})
  }
  todo.done = true
  response.json(todo).send(200)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const todo = user.todos.find(todo => {if(todo.id === id) return todo})
  if(!todo){
    response.status(404).json({error:"todo nao encontrado"})
  }
  user.todos.splice(todo, 1)
  response.status(204).json({message:"Todo deletado"}).send()
});

module.exports = app;