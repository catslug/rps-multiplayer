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

// Alerts DOM of player name changes, checks if there are already values for playerone/two
database.ref("playerOne/playerName").on("value", function(snapshot) {
	console.log(snapshot.val());

	$("#player1").html(snapshot.val());
});

database.ref("playerTwo/playerName").on("value", function(snapshot) {
	console.log(snapshot.val());

	$("#player2").html(snapshot.val());
})

/// When Player One wins changes, find a way to pull the name and insert it into div.
database.ref("playerOne/wins").on("value", function(snapshot) {
	$("#results").empty();

	var p = $("<p>");
	var winner = database.ref("playerOne/playerName").val();

	p.text(winner + " wins!").addClass("resultsDivText").appendTo("#results");
})

// See note in function above.
database.ref("playerTwo/wins").on("value", function(snapshot) {
	$("#results").empty();

	var p = $("<p>");
	var winner = database.ref("playerTwo/playerName").val();

	p.text(winner + " wins!").addClass("resultsDivText").appendTo("#results");
})

$(document).ready(function() {
	$("#startBtn").on("click", function() {
		var userName = $("#name-input").val();	

		database.ref().once("value").then(function(snapshot) {
			var checkIfPlayerOne = snapshot.child("playerOne").child("playerName").exists();
			var checkIfPlayerTwo = snapshot.child("playerTwo").child("playerName").exists();

			console.log(checkIfPlayerOne + " " + checkIfPlayerTwo);	

			if (!checkIfPlayerOne) {

				database.ref("playerOne").set({
					playerName: userName,
					wins: 0,
					losses: 0
				})

				$("#player1").empty();
				$("#player1").html(userName);

				var alertText = $("<p>");

				alertText.text(userName + ", you are Player 1.").appendTo("#user-input");

				choicesToTheDomLeft();
			}

			else if (!checkIfPlayerTwo) {
				
				database.ref("playerTwo").set({
					playerName: userName,
					wins: 0,
					losses: 0
				})

				$("#player2").empty();
				$("#player2").html(userName);

				var alertText = $("<p>");

				alertText.text(userName + ", you are Player 2.").appendTo("#user-input");

				choicesToTheDomRight();						
			};
		})

		console.log(userName)
	})
})

function choicesToTheDomLeft() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")

	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsOne").appendTo(rpsDiv);
	}

	rpsDiv.appendTo(".rps-div-left");
}

function choicesToTheDomRight() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")

	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsTwo").appendTo(rpsDiv);
	}

	rpsDiv.appendTo(".rps-div-right");
}

$(document).on("click", ".rockPaperScissorsOne", function() {
	var userChoice = $(this).attr("data-rps");
	console.log(userChoice);

	database.ref("playerOne").update({
		choice: userChoice
	})

	whoWonIt();
})

$(document).on("click", ".rockPaperScissorsTwo", function() {
	var userChoice = $(this).attr("data-rps");
	console.log(userChoice);

	database.ref("playerTwo").update({
		choice: userChoice
	})

	whoWonIt();
})

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
			console.log("line 142, still waiting on other player!");
		}

	})

}

function compareRPS(val1, val2) {
	if (val1 === val2) {
		console.log("you tied!");
		$("#result").html("You tied!");
	}

	else if (val1 === "rock") {
		if (val2 === "paper") {
			console.log("compare function player2 wins!");
			writeResultToPage(val2);
			incrementWinLoss("playerTwo", "playerOne");
		}

		else if (val2 === "scissors") {
			console.log("compare function player1 wins!");
			writeResultToPage(val1);
			incrementWinLoss("playerOne", "playerTwo");
		}
 	}

 	else if (val1 === "paper") {
 		if (val2 === "rock") {
 			console.log("compare function player1 wins!");
 			writeResultToPage(val1);
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "scissors") {
 			console.log("compare function player2 wins!");
 			writeResultToPage(val2);
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}

 	else if (val1 === "scissors") {
 		if (val2 === "paper") {
 			console.log("compare function player1 wins!");
 			writeResultToPage(val1);
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "rock") {
 			console.log("compare function player2 wins!");
 			writeResultToPage(val2);
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}
}

// Do I need this? Revisit Later
function writeResultToPage(val1) {
	$("#result").html(val1 + "wins!");
}

// Function to collect database wins/losses, increment new values, update in database
function incrementWinLoss(playerWin, playerLoss) {
	var wins
	var losses

	if (playerWin === "playerOne") {

		database.ref("playerOne").once("value").then(function(snapshot) {
			console.log(snapshot.child("playerOne").child("wins").val());
			wins = Number(snapshot.child("playerOne").child("wins").val());
			console.log("1 wins before increment" + wins);
			wins++;
			console.log("1 wins after increment" + wins); 
			database.ref("playerOne").update({
				wins: wins
			})
		})

		database.ref("playerTwo").once("value").then(function(snapshot) {
			losses = Number(snapshot.child("playerTwo").child("losses").val());
			console.log("2 loss berfore increment" + losses);
			losses++;
			console.log("2 loss after increment" + losses);
			database.ref("playerTwo").update({
				losses: losses
			})
		})
	}	

	else if (playerLoss === "playerOne") {

		database.ref("playerTwo").once("value").then(function(snapshot) {
			wins = Number(snapshot.child("playerTwo").child("wins").val());
			console.log("2 wins before increment" + wins);
			wins++;
			console.log("2 wins after increment" + wins);
			database.ref("playerTwo").update({
				wins: wins
			})
		})	

		database.ref("playerOne").once("value").then(function(snapshot) {
			losses = Number(snapshot.child("playerOne").child("losses").val());
			console.log("1 loses before increment" + losses);
			losses++;
			console.log("1 loses after increment" + losses);
			database.ref("playerOne").update({
				losses: losses
			}) 
		})
	}
}

// Write the result to the page after compare function
// Increment Wins and Losses, write to the page, push to firebase
// Show a button, retry
	// Retry will empty results div, repopulate choicestothedom, clear "choice" from firebase
// OnDisconnect function to handle when one player leaves
	// Reset wins and losses for all players.
	// Allow new player to join as Player One or Player Two  
