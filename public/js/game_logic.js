const buttonColors = ["red", "blue", "purple", "orange"]; // Options to pick from.
let gamePattern = []; // Array which saves the colors that were picked randomly, in the right order.
let userClickedPattern = []; // Array which saves the colors that the user picked.
let level = 0; // The game starts at level 1 but for the easy logic it starts at 0.
let started = false; // Flag which turn true after first key clicked in order to start the game.
let currentUserName = "";
let formSubmitted = true;
let lowestScoreOnTable; // We always saves the lowest score on scores table

// ============= Retrieving data from DB & display it on user's screen's table =============
function retrieve() {
  fetch("/api/place/1")
    .then((response) => response.json())
    .then((data) => {
      // Updating HTML using retrieved data
      document.getElementById("place1").innerHTML = data.place;
      document.getElementById("name1").innerHTML = data.name;
      document.getElementById("score1").innerHTML = data.score;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  fetch("/api/place/2")
    .then((response) => response.json())
    .then((data) => {
      // Updating HTML using the retrieved data
      document.getElementById("place2").innerHTML = data.place;
      document.getElementById("name2").innerHTML = data.name;
      document.getElementById("score2").innerHTML = data.score;
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  fetch("/api/place/3")
    .then((response) => response.json())
    .then((data) => {
      // Updating HTML using the retrieved data
      document.getElementById("place3").innerHTML = data.place;
      document.getElementById("name3").innerHTML = data.name;
      document.getElementById("score3").innerHTML = data.score;
      lowestScoreOnTable = data.score;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function playSound(name) {
  var audio = new Audio("/sounds/" + name + ".mp3");
  audio.play();
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function () {
    $("#" + currentColor).removeClass("pressed");
  }, 150);
}

// Picks next color + change title text level
function nextSequence() {
  userClickedPattern = []; // new every time  
  level++;
  $("#level-title").text("Level " + level);
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);
  $("#" + randomChosenColor).css("background-color", "black"); // Change to red
  setTimeout(function() {
    $("#" + randomChosenColor).css("background-color", ""); // Reset to original
    }, 200);
    playSound(randomChosenColor);
}

function prepareTostartOver() {
  level = 0;
  gamePattern = [];
  started = false;
}

// ####################################### Form

function showForm() {
  document.getElementById('popup-form').classList.remove('form-off');
  formSubmitted = false;
  document.getElementById('level-title').innerHTML = '<h1 style="font-size: 70px; color: #F86F03">Good Game!</h1>'; // Change header
  document.getElementsByClassName('footer')[0].classList.add('page-blur'); // blur the footer
  document.getElementsByClassName('scores_board')[0].classList.add('page-blur'); // blur the scores board
  document.getElementsByClassName('color_board')[0].classList.add('page-blur'); // blur the color board
}
function hideForm() {
  document.getElementById('popup-form').classList.add('form-off');
  formSubmitted = true;
  document.getElementsByClassName('footer')[0].classList.remove('page-blur'); // blur the footer
  document.getElementsByClassName('scores_board')[0].classList.remove('page-blur'); // blur the scores board
  document.getElementsByClassName('color_board')[0].classList.remove('page-blur'); // blur the color board
}

// #######################################

async function getUserName() {
  return new Promise((resolve) => {
    document.getElementsByClassName("form_button")[0].addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default form submission
      resolve();
    });
  });
}

async function playSuccessSounds() {
  // Functions that plays the success sounds
  function playSounds(soundList) {
    function playNextSound(index) {
      if (index >= soundList.length) {
        return;
      }
      const audio = new Audio("/sounds/" + soundList[index] + ".mp3");
      audio.play();

      audio.addEventListener("ended", function () {
        playNextSound(index + 1);
      });
    }
    playNextSound(0);
  }
  let list = ["success", "applause"];
  playSounds(list);
}

// Function activates win effects + get user name + make a post request to server with user name & score.
async function ifBetterScore() {
  playSuccessSounds();
  showForm();
  await getUserName(); // Wait for the user to submit the form
  currentUserName = document.getElementById("name-input").value;
  document.getElementById("name-input").value = ""; // Clear the input value to prepare for the next click

  let contender = { newName: currentUserName, newScore: level - 1 };

  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contender)
  })

  setTimeout(() => {
    retrieve();
    $("#level-title").text("To start the game, launch the");
    prepareTostartOver();
    hideForm();
  }, 1000);
};

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function () {
        nextSequence();
      }, 1000);
    }
  }
  else {
    // checking if current score > third place on table's scores
    if (level - 1 > lowestScoreOnTable) {
      ifBetterScore(); // User failed => checking if score is better than any table's scores
    }
    else {
      playSound("wrong");
      $("#level-title").text("Game over");
      return_rocket();
      setTimeout(function () {
        $("#level-title").text("To start the game, launch the");
      }, 2000);

      prepareTostartOver();
    }
  }
}

// ############################################################

function start_rocket() {
  $(document).ready(function () {
    $("#rocket").click(function () {
      // Start the animation when the button is clicked
      $(this).css("animation", "moveOut 4s ease-in-out forwards"); 
    });
  });
}

function return_rocket() {
  $("#rocket").css("animation", "moveBack 3s forwards");
}

// ========== WORK STARTS HERE ==========
hideForm();
retrieve();
start_rocket();
$(document).ready(function () {
  $("#rocket").click(function () {
    if (!started && formSubmitted) {
      $("#level-title").text("Level " + level);
      nextSequence();
      started = true;
    }
  });
});

// Activate effects when the user click on a color
$(".btn").click(function () {
  if (formSubmitted) {
    var userChosenColor = $(this).attr("id");
    userClickedPattern.push(userChosenColor);
    playSound(userChosenColor);
    animatePress(userChosenColor);
    checkAnswer(userClickedPattern.length - 1);
  }
});

