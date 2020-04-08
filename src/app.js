const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

function logreqs(req, res, next) {
  const { method, url } = req;
  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel)
  next()
  console.timeEnd(logLabel)
}

function validateRepoId(req, res, next) {
  const { id } = req.params

  if (!isUuid(id)) {
    return res.status(400).json({ error: "Invalid project ID" })
  }

  return next();
}

const repositories = [];

app.use(logreqs)
app.use("/repositories/:id", validateRepoId)

app.get("/repositories", (req, res) => {
  return res.json(repositories);
});

app.post("/repositories", (req, res) => {
  const { title, url, techs } = req.body;

  const newRepo = { id: uuid(), title, url, techs, likes: 0 };
  repositories.push(newRepo);
  return res.json(newRepo);

});

app.put("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const { title, url, techs } = req.body;

  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return res.status(400).json({ error: 'Repository not found' })
  }
  const updatedRepo = { ...repositories[repoIndex], title, url, techs };

  repositories[repoIndex] = updatedRepo;
  return res.json(updatedRepo)
});

app.delete("/repositories/:id", (req, res) => {
  const { id } = req.params;
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return res.status(400).json({ error: 'Repository not found' })
  }
  repositories.splice(repoIndex, 1);
  return res.status(204).send();
});

app.post("/repositories/:id/like", (req, res) => {
  const { id } = req.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);
  if (repoIndex < 0) {
    return res.status(400).json({ error: 'Repository not found' })
  }
  const likes = repositories[repoIndex].likes + 1;
  const likedRepo = { ...repositories[repoIndex], likes };

  repositories[repoIndex] = likedRepo;
  return res.json(likedRepo)
});

module.exports = app;
