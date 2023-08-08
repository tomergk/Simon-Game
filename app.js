const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const port = 3000;

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// ============= Connect =============
async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (error) {
    throw new Error(error);
  }
}
connect();

// ============= Schema =============
const placeSchema = new mongoose.Schema({
  name: String,
  score: Number,
  place: Number
});

// ============= Model =============
const Place = mongoose.model('Place', placeSchema);

// ============= Default Documents =============
const contender1 = new Place({
  name: "Ravit",
  score: 3,
  place: 1
});

const contender2 = new Place({
  name: "PitzPitz",
  score: 2,
  place: 2
});

const contender3 = new Place({
  name: "Mini",
  score: 1,
  place: 3
});

// ============= Insert default documents To default Array =============
const defaultItems = [contender1, contender2, contender3];

// ============= If current collection is empty => insert default array (should be inserted only once) =============
Place.countDocuments({}, function (err, count) {
  console.log('============================================================');
  console.log(`Number of documents inside collection is: ${count}`);
  if (count < 3) {
    Place.insertMany(defaultItems, function (error, docs) {
      if (!error) {
        console.log('inserted default items to collection');
      }
      else {
        console.error(`the error occurs when trying to insert docs when collection is empty, error is: ${error}`);
      }
    });
  }
  startServer();
});

// ============= GET REQUESTS to use in game_logic.js file, in order to fetch data =============
app.get("/api/place/1", (req, res) => {
  Place.findOne({ place: 1 }).exec()
    .then((firstPlace) => {
      res.json(firstPlace); // Send the retrieved data as a response
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/api/place/2", (req, res) => {
  Place.findOne({ place: 2 }).exec()
    .then((firstPlace) => {
      res.json(firstPlace); // Send the retrieved data as a response
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/api/place/3", (req, res) => {
  Place.findOne({ place: 3 }).exec()
    .then((firstPlace) => {
      res.json(firstPlace); // Send the retrieved data as a response
    })
    .catch((error) => {
      res.status(500).json({ error: "Internal server error" });
    });
});

// ============= POST REQUEST =============

/* This post request gets two parameters from client side: name & score,
 It finds all documents from DB and update database with the new contender. */
app.post("/", async (req, res) => {
  try {
    // Getting user name & score
    const { newName, newScore } = req.body;

    // Retrieving DB documents
    let firstDoc = await Place.findOne({ place: 1 }).exec();
    let secondDoc = await Place.findOne({ place: 2 }).exec();

    // Performing a comparison logic + update the right docs
    if (newScore > secondDoc.score) {

      if (newScore > firstDoc.score) { // updating first place, second place, third place
        await Place.findOneAndUpdate({ place: 1 }, { $set: { name: newName, score: newScore } });
        await Place.findOneAndUpdate({ place: 2 }, { $set: { name: firstDoc.name, score: firstDoc.score } });
        await Place.findOneAndUpdate({ place: 3 }, { $set: { name: secondDoc.name, score: secondDoc.score } });
      }

      else { // updating second place, third place 
        await Place.findOneAndUpdate({ place: 2 }, { $set: { name: newName, score: newScore } });
        await Place.findOneAndUpdate({ place: 3 }, { $set: { name: secondDoc.name, score: secondDoc.score } });
      }
    }

    else { // updating third place
      await Place.findOneAndUpdate({ place: 3 }, { $set: { name: newName, score: newScore } });
    }

    // Send a success response
    res.status(200).json({ success: true });
  }

  catch (error) {
    // Handle any errors and send an error response
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ============= Listen =============
function startServer() {
  app.listen(port, () => {
    console.log('Server started on port ' + port);
  });
}