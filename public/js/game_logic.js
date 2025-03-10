const buttonColors = ["red", "blue", "yellow", "green"]; 
let gamePattern = []; // Array that saves colors that picked randomly, in the right order.
let userClickedPattern = []; // Array that saves the colors that the user picked.
let level = 0; // The game starts at level 1 but for easy logic it starts at 0.
let started = false; // Flag turn true after game activated in order to start the game.
let currentUserName = "";
let formSubmitted = true;
let lowestScoreOnTable; // Lowest score from scores table

const activateButton = document.getElementById('activate-button');
const hoverSound = document.getElementById('hover-sound');
const pressButton = document.getElementById('press-button');
const exit = document.getElementById('exit');
const boom = document.getElementById('boom');

// ############################
// User Instructions: for User's understanding & Audio to work 
document.addEventListener("DOMContentLoaded", function() {
  const okButton = document.getElementById("instructions-ok");
  const instructionsAudio = document.getElementById("instructions");
  // Read aloud option
  document.getElementById("read-instructions").addEventListener("click", function() {
    instructionsAudio.currentTime = 0;
    instructionsAudio.play();
  });

  if (okButton) {
    okButton.addEventListener("click", function() {
      document.getElementById("instructions-modal").style.display = "none";
      instructionsAudio.pause();
    });
  }
});


// ############################ 


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
  $("#" + randomChosenColor).css("background-color", "black"); // blackaning
  setTimeout(function() {
    $("#" + randomChosenColor).css("background-color", ""); // Reset to original
    }, 200);
    playSound(randomChosenColor);
}

function prepareTostartOver() {
  level = 0;
  gamePattern = [];
  started = false;
  
  // Reset the rocket's image: remove any animation and set it back to the initial transform.
  $("#rocket img").css({
    "animation": "none",
    "transform": "scale(0) rotate(0deg)"
  });
  
  // Call the reset function to handle showing the rocket and activating the button with the pop effect.
  resetRocketAndActivateButton();
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

function activateRocketAndStartGame() {
  $("#activate-button").click(function () {
    console.log("active button is ready to be clicked");
    // Start the rocket's animation on its image
    $("#rocket img").css("animation", "moveOut 2s ease-in-out forwards");
    console.log("rockets animation activated");
    // When the animation ends, hide the rocket and the activate button
    $("#rocket img").one("animationend", function () {
      $("#rocket").hide();
      console.log("hide the rocket");
      $("#activate-button").hide();
      console.log("hide active button rocket");

      // Start the game if it hasn't already started
      if (!started && formSubmitted) {
        console.log("if didnt start the game then change next level title and choose next sequence and change started var to true");
        $("#level-title").text("Level " + level);
        nextSequence();
        started = true;
      }
    });
  });
}

// Activate sound for hovering over the activated
activateButton.addEventListener('mouseenter', () => {
  hoverSound.currentTime = 0; // Restart sound if needed
  hoverSound.play();
  hoverSound.loop = true;
});
activateButton.addEventListener('mouseleave', () => {
  hoverSound.pause();
  hoverSound.loop = false;     // reset looping
});

// Activate sound for pressing on the activate-button
activateButton.addEventListener('click', () => {
  pressButton.currentTime = 0;
  pressButton.play();
  setTimeout(() => {
  exit.currentTime = 0;
  exit.play();
}, 300); 
setTimeout(() => {
  boom.currentTime = 0;
  boom.play();
}, 2000); 
});

function resetRocketAndActivateButton() {
  $("#rocket").show();
  // Wait 3 seconds, then show the activate button with the pop-in effect.
  setTimeout(function () {
    $("#activate-button")
      .show() // Ensure the button is visible
      .css("animation", "popIn 1s ease forwards"); // Apply the pop-in animation
  }, 3000);
}

// +++++++++++++++++

function return_rocket() {
  $("#rocket").css("animation", "moveBack 3s forwards");
}

// ========== WORK STARTS HERE ==========
hideForm();
console.log("hiding form");
retrieve();
console.log("retriving data from db");
$(document).ready(function () {
  $("#rocket").click(function () {
    if (!started && formSubmitted) {
      $("#level-title").text("Level " + level);
      nextSequence();
      started = true;
      console.log("rocket is ready to be clicked and if not started, then putting title level & choosing next sequence & start=true");
    }
  });

  activateRocketAndStartGame();
  console.log("activating rocket");

  // Activate effects when the user click on a color
  $(".btn").click(function () {
    if (formSubmitted) {
      var userChosenColor = $(this).attr("id");
      console.log("userChosenColor:" + userChosenColor);
      userClickedPattern.push(userChosenColor);
      playSound(userChosenColor);
      animatePress(userChosenColor);
      checkAnswer(userClickedPattern.length - 1);
    }
  });

});