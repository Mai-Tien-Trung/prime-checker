import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";

import {
  findByUsername,
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie
} from "./utils/db.js";

import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = findByUsername(username);

  if (!user || password !== user._password) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token });
});

app.get("/api/watchlist/:userId", authenticate, (req, res) => {
  const watchlist = getWatchlist(Number(req.params.userId));

  if (watchlist === null) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json(watchlist);
});

app.post(
  "/api/watchlist/:userId/movies",
  authenticate,
  authorizeModification,
  (req, res) => {
    const movie = addMovie(Number(req.params.userId), req.body);

    if (!movie) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(201).json(movie);
  }
);

app.put(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const movie = updateMovie(
      Number(req.params.userId),
      Number(req.params.movieId),
      req.body
    );

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json(movie);
  }
);

app.delete(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const deleted = deleteMovie(
      Number(req.params.userId),
      Number(req.params.movieId)
    );

    if (!deleted) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted successfully." });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});