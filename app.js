const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(9000, () => {
      console.log("DB Connected successfully at 9000");
    });
  } catch (error) {
    console.log("error detected at 9000");
    process.exit(1);
  }
};

initializeDbAndServer();

//API1

app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT movie_name  FROM movie;
    `;
  const moviesArray = await db.all(moviesQuery);
  const updatedData = moviesArray.map((eachItem) => ({
    movieName: eachItem.movie_name,
  }));
  response.send(updatedData);
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `
    INSERT INTO movie(
      director_id,movie_name,lead_actor
    )
    VALUES(
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );
  `;
  const dbResponse = await db.run(createMovieQuery);
  const movieId = dbResponse.lastID;
  //response.send({ movieId: movieId });
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId}
    `;
  const MovieItem = await db.get(getMovieQuery);
  if (MovieItem === undefined) {
    response.status(400);
    response.send("cannot find movies with this id");
  }
  const { movie_id, director_id, movie_name, lead_actor } = MovieItem;
  const updatedData = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  };
  response.send(updatedData);
});

//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `
        UPDATE 
        movie 
        SET
        director_id='${directorId}',
        movie_name='${movieName}',
        lead_actor='${leadActor}' 
        WHERE movie_id=${movieId};
        `;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE 
        FROM 
        movie 
        WHERE movie_id=${movieId};
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API6
app.get("/directors/", async (request, response) => {
  const directorQuery = `
    SELECT
        * 
    FROM 
    director 
    `;
  const directorsArray = await db.all(directorQuery);
  const updatedDirectorsArray = directorsArray.map((eachItem) => ({
    directorId: eachItem.director_id,
    directorName: eachItem.director_name,
  }));
  response.send(updatedDirectorsArray);
});

//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorQuery = `
    SELECT 
        movie_name as movieName
    FROM 
    movie
    WHERE director_id=${directorId}
    `;
  const directorData = await db.all(directorQuery);
  response.send(directorData);
});

module.exports = app;
