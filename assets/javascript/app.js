var config = {
    apiKey: "AIzaSyAjBhggTSB6eWSwLS9MJutq78Iqs5Ks29M",
    authDomain: "rock-paper-scissors-whoa.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-whoa.firebaseio.com",
    projectId: "rock-paper-scissors-whoa",
    storageBucket: "rock-paper-scissors-whoa.appspot.com",
    messagingSenderId: "519010906964"
  };

firebase.initializeApp(config);

var database = firebase.database();
var timer
var wins1 = 0;
var wins2 = 0; 
var loss1 = 0;
var loss2 = 0;
var round = 1;

///////////////////////////////////////////////////////////////////////////
/// Listeners for database changes
database.ref("playerOne/playerName").on("value", function(snapshot) {
	$("#player1").html(snapshot.val());
});

database.ref("playerTwo/playerName").on("value", function(snapshot) {
	$("#player2").html(snapshot.val());
})

database.ref("status").on("value", function(snapshot) {
	console.log("status changed to" + snapshot.child("status").val());

	$("#result").empty();
	$("#result").html(snapshot.child("status").val());
})

// database.ref("status/round").on("value", function(snapshot) {
	
// // This isn't working properly, because round isn't working. 
// 	if (snapshot.val() > 0) {
// 		$("#rps-div-left").empty();
// 		$("#rps-div-right").empty();
// 		choicesToTheDomLeft();
// 		choicesToTheDomRight();
// 	}
// })

database.ref("status/round").on("value", function(snapshot) {
	currentRound = snapshot.val();
	console.log(currentRound);

	if (currentRound === 3) {
		// The button shows automatically. HA HAHAHA HA AHAH AH BUTTON DOESN'T WORK. It's fine. FINE. 
		$("<button id='resetBtn'>").text("Retry?").	addClass("buttonStyle").appendTo("#buttonSpot");
		console.log("button was created");
	}
})

database.ref("playerOne/wins").on("value", function(snapshot) {
	$("#playerOneWins").html(snapshot.val());
})

database.ref("playerTwo/wins").on("value", function(snapshot) {
	$("#playerTwoWins").html(snapshot.val());
})

database.ref("playerOne/losses").on("value", function(snapshot) {
	$("#playerOneLosses").html(snapshot.val());
})

database.ref("playerTwo/losses").on("value", function(snapshot) {
	$("#playerTwoLosses").html(snapshot.val());
})
///////////////////////////////////////////////////////////////////////////

// Handles Player name-inputs, initializes playerone/two DB stats, writes them to the DOM
$(document).ready(function() {
	$("#startBtn").on("click", function() {
		var userName = $("#name-input").val();	

		// Question: Should this be a function? That I can re-call for restart? 
		database.ref().once("value").then(function(snapshot) {
			var checkIfPlayerOne = snapshot.child("playerOne").child("playerName").exists();
			var checkIfPlayerTwo = snapshot.child("playerTwo").child("playerName").exists();

			if (!checkIfPlayerOne) {

				wins1 = 0;
				loss1 = 0;

				database.ref("playerOne").set({
					playerName: userName,
					wins: wins1,
					losses: loss1
				})

				$("#player1").empty();
				$("#player1").html(userName);
				$("#playerOneWins").html("0");
				$("#playerOneLosses").html("O");
				$("#user-input").empty();

				var alertText = $("<p>");

				alertText.text(userName + ", you are Player 1.").appendTo("#user-input");

				choicesToTheDomLeft();

				var status = "Waiting on another player to join."
				$("#result").empty();
				$("#result").html(status);

				database.ref("status").set({
					status: status,
					round: round
				})
			}

			else if (!checkIfPlayerTwo) {
				
				wins2 = 0;
				loss2 = 0;

				database.ref("playerTwo").set({
					playerName: userName,
					wins: wins2,
					losses: loss2
				})

				$("#player2").empty();
				$("#player2").html(userName);
				$("#playerTwoWins").html("0");
				$("#playerTwoLosses").html("O");
				$("#user-input").empty();

				var alertText = $("<p>");

				alertText.text(userName + ", you are Player 2.").appendTo("#user-input");

				choicesToTheDomRight();	

				var status = userName + " has joined! You're ready to go."
				$("#result").empty();
				$("#result").html(status);

				database.ref("status").update({
					status: status
				})					
			};
		})
	})

	$("#resetBtn").on("click", function() {
		$("#resetBtn").remove();
		// restart. but how do I get it to just show the choices to the relevant page.
		round = 1;

		database.ref().on("value", function(snapshot) {
			currentPlayer = snapshot.child(key).val();
			if (currentPlayer === playerOne) {
				choicesToTheDomLeft();
			}

			else if (currentPlayer === playerTwo) {
				choicesToTheDomRight();
			}

			database.ref("status").update({
				round: round
			})
		})
	})
})

// writes RPS choices to Player 1's div, adds classes for styling and attr captures
function choicesToTheDomLeft() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")

	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsOne").appendTo(rpsDiv);
	}

	rpsDiv.appendTo(".rps-div-left");
}

// writes RPS choices to Player 2's div, adds classes for styling and attr captures
function choicesToTheDomRight() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")

	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsTwo").appendTo(rpsDiv);
	}

	rpsDiv.appendTo(".rps-div-right");
}

// handles events when player 1 makes an RPS selection, saves it in firebase
$(document).on("click", ".rockPaperScissorsOne", function() {
	round++;
	var userChoice = $(this).attr("data-rps");
	$(".rps-div-left").empty();
	$("<p>").text(userChoice).addClass("userPickedMe").appendTo(".rps-div-left");

	database.ref("playerOne").update({
		choice: userChoice
	})

	whoWonIt();
})

// handles events when player 2 makes an RPS selection, saves it in firebase
$(document).on("click", ".rockPaperScissorsTwo", function() {
	round++;
	var userChoice = $(this).attr("data-rps");
	$(".rps-div-right").empty();
	$("<p>").text(userChoice).addClass("userPickedMe").appendTo(".rps-div-right");

	database.ref("playerTwo").update({
		choice: userChoice
	})

	whoWonIt();
})

// checks to see if both players have made selections, calls the compare function when true
function whoWonIt() {
	database.ref().once("value").then(function(snapshot) {
		var checkIfPlayerOneSelected = snapshot.child("playerOne").child("choice").exists();
		var checkIfPlayerTwoSelected = snapshot.child("playerTwo").child("choice").exists();

		if (checkIfPlayerOneSelected && checkIfPlayerTwoSelected) {
			var playerOneChoice = snapshot.child("playerOne").child("choice").val();
			var playerTwoChoice = snapshot.child("playerTwo").child("choice").val();

			compareRPS(playerOneChoice, playerTwoChoice);
		}

		else {
			console.log("line 196, still waiting on other player!");
		}
	})
}

// Compares the RPS choices of both users and determines winner.
function compareRPS(val1, val2) {
	if (val1 === val2) {
		console.log("you tied!");
		$("#result").empty();
		$("#result").html("You tied!");
	}

	else if (val1 === "rock") {
		if (val2 === "paper") {
			console.log("compare function player2 wins!");
			incrementWinLoss("playerTwo", "playerOne");
		}

		else if (val2 === "scissors") {
			console.log("compare function player1 wins!");
			incrementWinLoss("playerOne", "playerTwo");
		}
 	}

 	else if (val1 === "paper") {
 		if (val2 === "rock") {
 			console.log("compare function player1 wins!");
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "scissors") {
 			console.log("compare function player2 wins!");
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}

 	else if (val1 === "scissors") {
 		if (val2 === "paper") {
 			console.log("compare function player1 wins!");
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "rock") {
 			console.log("compare function player2 wins!");
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}
}

// Function to check current database wins/losses, increment to new values, update in database
function incrementWinLoss(playerWin, playerLoss) {
	if (playerWin === "playerOne") {

		database.ref("playerOne").once("value").then(function(snapshot) {

			// wins = Number(snapshot.child("playerOne").child("wins").val());
			wins1++;
			// I don't think wins are continuing to increment above 1. 
			console.log("line 266 playerOne wins: " + wins1);

			winner = snapshot.child("playerName").val(); 
			console.log(winner);

			var status = winner + " wins!";
			var p = $("<p>");
			p.text(status).addClass("resultsDivText").appendTo("#result");
			resetChoices();

			database.ref("status").update({
				status: status
			})

			database.ref("playerOne").update({
				wins: wins1
			})
		})

		database.ref("playerTwo").once("value").then(function(snapshot) {
			// losses = Number(snapshot.child("playerTwo").child("losses").val());
			loss2++;

			database.ref("playerTwo").update({
				losses: loss2
			})
		})
	}	

	else if (playerLoss === "playerOne") {

		database.ref("playerTwo").once("value").then(function(snapshot) {
			// wins = Number(snapshot.child("playerTwo").child("wins").val());
			wins2++;

			winner = snapshot.child("playerName").val();
			console.log(winner);

			var status = winner + " wins!"
			var p = $("<p>");
			p.text(winner + " wins!").addClass("resultsDivText").appendTo("#result");
			resetChoices();

			database.ref("status").update({
				status: status
			})

			database.ref("playerTwo").update({
				wins: wins2
			})
		})	

		database.ref("playerOne").once("value").then(function(snapshot) {

			// losses = Number(snapshot.child("playerOne").child("losses").val());
			loss2++;

			database.ref("playerOne").update({
				losses: loss2
			}) 
		})
	}
}

function resetChoices() {
	timer = setTimeout(emptyTheDiv, 2000)

	function emptyTheDiv() {
		var status = "Ready, set, go!"

		database.ref("status").update({
			status: status,	
		});	

		database.ref("status").once("value").then(function(snapshot) {
			// var round = Number(snapshot.child("status").child("round").val());
			console.log("line 324 round is " + round)
			round++; 
			console.log("line 325 round is " + round)

				// Round did not increment. FIX THIS. Nothing works. I'm tired.
			database.ref("status").update({
				round: round
			})
		});	

		clearTimeout(timer);
	}

	database.ref("playerOne/choice").remove();
	database.ref("playerTwo/choice").remove();
}

// This doesn't work. If one player disconnects, both disconnect. Status doesn't update.
// database.ref("playerOne").once("value", function(snapshot) {
// 	if (snapshot.val()) {
// 		database.ref("playerOne").onDisconnect().remove();

// 		database.ref("status").update({
// 			status: "Sorry, everyone disconnected. Everything is broken."
// 		})
// 	}
// })

// database.ref("playerTwo").once("value", function(snapshot) {
// 	if (snapshot.val()) {
// 		database.ref("playerTwo").onDisconnect().remove();

// 		database.ref("status").update({
// 			status: "Sorry, everyone disconnected. Everything is broken."
// 		})
// 	}
// })


// Timed 2 second reset, status shown in results div.
	// Retry will empty results div (check), repopulate choicestothedom (nope, populating on both windows), 
	// clear "choice" from firebase (check)
	// 
	// On refresh page / disconnect, you lose the choices but game doesn't reset.
	// wins and losses aren't incrementing past 1. round is also obscurely stuck? 
// OnDisconnect function to handle when one player leaves
	// Reset wins and losses for all players.
	// Allow new player to join as Player One or Player Two  
