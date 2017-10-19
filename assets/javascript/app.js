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
var currentPlayer
var currentPlayerName

///////////////////////////////////////////////////////////////////////////
/// Listeners for database changes
database.ref("playerOne/playerName").on("value", function(snapshot) {
	var checkIfExists = snapshot.val();

	if (checkIfExists !== null) {
		$("#player1").html(snapshot.val());
	}
});

database.ref("playerTwo/playerName").on("value", function(snapshot) {
	var checkIfExists = snapshot.val();
	
	if (checkIfExists !== null) {
		$("#player2").html(snapshot.val());
	}
});

database.ref("status").on("value", function(snapshot) {
	$("#result").empty();
	$("#result").html(snapshot.child("status").val());
});

database.ref("status/round").on("value", function(snapshot) {
	var currentRound = snapshot.val();
	if (currentRound === 3) {
		$(".rps-div-right").removeClass("hideRPSChoices");
		$(".rps-div-left").removeClass("hideRPSChoices");
		$(".userPickedMe").remove();
		round = 1;

		database.ref("status").update({
			round: round
		})
	}
});

database.ref("playerOne/wins").on("value", function(snapshot) {
	$("#playerOneWins").html(snapshot.val());
	wins1 = snapshot.val();
});

database.ref("playerTwo/wins").on("value", function(snapshot) {
	$("#playerTwoWins").html(snapshot.val());
	wins2 = snapshot.val();
});

database.ref("playerOne/losses").on("value", function(snapshot) {
	$("#playerOneLosses").html(snapshot.val());
	loss1 = snapshot.val();
});

database.ref("playerTwo/losses").on("value", function(snapshot) {
	$("#playerTwoLosses").html(snapshot.val());
	loss2 = snapshot.val();
});

// This removes both players when one disconnects. Which is not as intended. 
database.ref("playerOne").onDisconnect().remove();
database.ref("playerTwo").onDisconnect().remove();

// Removes the status children so the page is reset when someone comes back later.
database.ref().on("child_removed", function() {
	database.ref("status").remove();
	database.ref("chat").remove();
});

database.ref().on("value", function(snapshot) {
	var isPlayerOneChoice = snapshot.child("playerOne").child("choice").exists();
	var isPlayerTwoChoice = snapshot.child("playerTwo").child("choice").exists();
	var playerOneChoice = snapshot.child("playerOne").child("choice").val();
	var playerTwoChoice = snapshot.child("playerTwo").child("choice").val();
	console.log(playerOneChoice + " " + playerTwoChoice)

	if (isPlayerOneChoice && isPlayerTwoChoice) {
		var pResultRight = $("<p>");
		var pResultLeft = $("<p>");	

		$(".userPickedMe").remove();
		pResultRight.text(playerTwoChoice).addClass("userPickedMe").appendTo(".user-div-right");
		pResultLeft.text(playerOneChoice).addClass("userPickedMe").appendTo(".user-div-left");
	}
})

database.ref("chat").on("child_added", function(snapshot) {
	console.log(snapshot.val());
	var message = snapshot.val().message;
	var sender = snapshot.val().sender;
	var player = snapshot.val().player;

	var chatText = $("<p>");

	chatText.text(sender + ": " + message).appendTo("#say-it");	
})

///////////////////////////////////////////////////////////////////////////

// Handles Player name-inputs, initializes playerone/two DB stats, writes them to the DOM
$(document).ready(function() {
	$("#startBtn").on("click", function() {
		if ($("#name-input").val() === "") {
			alert("Please type in a name!")
		}

		else {
			var userName = $("#name-input").val();	

			// Determines if playerOne and/or playerTwo exists, logs their info, sets initial stats.
			database.ref().once("value").then(function(snapshot) {
				var checkIfPlayerOne = snapshot.child("playerOne").child("playerName").exists();
				var checkIfPlayerTwo = snapshot.child("playerTwo").child("playerName").exists();

				if (!checkIfPlayerOne) {

					wins1 = 0;
					loss1 = 0;
					currentPlayer = "playerOne";
					currentPlayerName = userName;

					database.ref("playerOne").set({
						playerName: userName,
						wins: wins1,
						losses: loss1
					})

					$("#player1").empty();
					$("#player1").html(userName);
					$("#playerOneWins").html(wins1);
					$("#playerOneLosses").html(loss1);
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
					currentPlayer = "playerTwo";
					currentPlayerName = userName;

					database.ref("playerTwo").set({
						playerName: userName,
						wins: wins2,
						losses: loss2
					})

					$("#player2").empty();
					$("#player2").html(userName);
					$("#playerTwoWins").html(wins2);
					$("#playerTwoLosses").html(loss2);
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
		}
	})
})

// writes RPS choices to playerOne's div, adds classes for styling and attr captures
function choicesToTheDomLeft() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")
	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsOne").appendTo(rpsDiv);
	}
	rpsDiv.addClass("rpsDiv").appendTo(".rps-div-left");
}

// writes RPS choices to playerTwo's div, adds classes for styling and attr captures
function choicesToTheDomRight() {
	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")
	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).attr("data-rps", rps[i]).addClass("rockPaperScissors rockPaperScissorsTwo").appendTo(rpsDiv);
	}
	rpsDiv.addClass("rpsDiv").appendTo(".rps-div-right");
}

// handles events when playerOne makes a selection, saves it in firebase
$(document).on("click", ".rockPaperScissorsOne", function() {
	round++; // increments the round for player selection
	var userChoice = $(this).attr("data-rps");
	var p = $("<p>");
	$(".rps-div-left").addClass("hideRPSChoices"); // hides the options after selection
	p.text(userChoice).addClass("userPickedMe").appendTo(".user-div-left");

	database.ref("playerOne").update({
		choice: userChoice
	})

	database.ref("status").update({
		status: "",
		round: round
	})

	whoWonIt();
})

// handles events when player 2 makes a selection, saves it in firebase
$(document).on("click", ".rockPaperScissorsTwo", function() {
	round++; // increments the round for player selection
	var userChoice = $(this).attr("data-rps");
	var p = $("<p>");
	$(".rps-div-right").addClass("hideRPSChoices"); // hides the options after selection
	p.text(userChoice).addClass("userPickedMe").appendTo(".user-div-right");

	database.ref("playerTwo").update({
		choice: userChoice
	})

	database.ref("status").update({
		status: "",
		round: round
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
			console.log("line 239: " + playerOneChoice + " " + playerTwoChoice);
		}
	})
}

// Compares the RPS choices of both users and determines winner.
function compareRPS(val1, val2) {
	if (val1 === val2) {
		$("#result").empty();
		var status = "You tied!";
		var p = $("<p>");
		p.text(status).addClass("resultsDivText").appendTo("#result");
		resetChoices();

		// find a way to call showWhatYouPicked();

		database.ref("status").update({
			status: status
		});
	}

	else if (val1 === "rock") {
		if (val2 === "paper") {
			incrementWinLoss("playerTwo", "playerOne");
		}

		else if (val2 === "scissors") {
			incrementWinLoss("playerOne", "playerTwo");
		}
 	}

 	else if (val1 === "paper") {
 		if (val2 === "rock") {
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "scissors") {
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}

 	else if (val1 === "scissors") {
 		if (val2 === "paper") {
 			incrementWinLoss("playerOne", "playerTwo");
 		}

 		else if (val2 === "rock") {
 			incrementWinLoss("playerTwo", "playerOne");
 		}
 	}
}

// Function to check current database wins/losses, increment to new values, update in database
function incrementWinLoss(playerWin, playerLoss) {
	if (playerWin === "playerOne") {
		database.ref().once("value").then(function(snapshot) {
			wins1++;
			loss2++;
			database.ref("playerOne").update({
				wins: wins1
			})

			database.ref("playerTwo").update({
				losses: loss2
			})

			winner = snapshot.child("playerOne").child("playerName").val(); 

			var status = winner + " wins!";
			var oppoChoiceLeft = snapshot.child("playerOne").child("choice").val();
			var oppoChoiceRight = snapshot.child("playerTwo").child("choice").val();
			showWhatYouPicked(status, oppoChoiceRight, oppoChoiceLeft);

			database.ref("status").update({
				status: status
			})
		})
	}	

	else if (playerLoss === "playerOne") {
		database.ref().once("value").then(function(snapshot) {
			wins2++;
			loss1++;

			database.ref("playerOne").update({
				losses: loss1
			})

			database.ref("playerTwo").update({
				wins: wins2
			})

			winner = snapshot.child("playerTwo").child("playerName").val();

			var status = winner + " wins!";
			var oppoChoiceLeft = snapshot.child("playerOne").child("choice").val();
			var oppoChoiceRight = snapshot.child("playerTwo").child("choice").val();
			showWhatYouPicked(status, oppoChoiceRight, oppoChoiceLeft);

			database.ref("status").update({
				status: status
			})
		})	
	}
}

function showWhatYouPicked(status, choiceRight, choiceLeft) {
	var pStatus = $("<p>");
	var pResultRight = $("<p>");
	var pResultLeft = $("<p>");	

	$(".userPickedMe").remove();
	pStatus.text(status).addClass("resultsDivText").appendTo("#result");
	pResultRight.text(choiceRight).addClass("userPickedMe").appendTo(".user-div-right");
	pResultLeft.text(choiceLeft).addClass("userPickedMe").appendTo(".user-div-left");
	resetChoices();
}

function resetChoices() {
	timer = setTimeout(emptyTheDiv, 2500);
	round++;

	function emptyTheDiv() {
		var status = "Ready, set, go!";

		database.ref("status").update({
			status: status,	
			round: round
		});	

		clearTimeout(timer);
	}

	database.ref("playerOne/choice").remove();
	database.ref("playerTwo/choice").remove();
}

$(document).ready(function() {
	$("#submit").on("click", function() {
		var chatMessage = $("#user-words").val().trim();
		$("#user-words").val("");
		var sender = currentPlayerName;
		console.log(sender + " says " + chatMessage);

		database.ref("chat").push({
			message: chatMessage,
			sender: sender,
			player: currentPlayer
		})
	})
})

// OnDisconnect function to handle when one player leaves
	// Reset wins and losses for all players.
	// Allow new player to join as Player One or Player Two  