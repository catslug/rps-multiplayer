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
var playerFirst = false;
var playerSecond = false;
// false isn't working for playertwo because not communicating between docs duh

// this isn't working to make sure the value of the thing that changed is written to doc
database.ref("playerOne/playerName").on("value", function(snapshot) {
	console.log(snapshot.val());

	$("#player1").html(snapshot.val());
	choicesToTheDom();
});

database.ref("playerTwo/playerName").on("value", function(snapshot) {
	console.log(snapshot.val());

	$("#player2").html(snapshot.val());
	choicesToTheDom();
})

// $(document).on("load", function() {

// })

$(document).ready(function() {
	
	$("#startBtn").on("click", function() {
		var userName = $("#name-input").val();

		// THIS DOESN'T WORK FOR SOME REASON.
		// if (playerFirst === true && playerSecond === true) {
		// 	alert("Sorry, you'll have to wait! There are two players already.")
		// }

		if (playerFirst === false) {  
			
			playerFirst = true;

			database.ref("playerOne").set({
				playerName: userName
			})

			$("#player1").empty();
			$("#player1").html(userName);

			var alertText = $("<p>");

			alertText.text(userName + ", you are Player 1.").appendTo("#user-input");

			choicesToTheDom();
		}

		else if (playerSecond === false) {

			playerSecond = true;

			database.ref("playerTwo").set({
				playerName: userName
			})

			$("#player2").empty();
			$("#player2").html(userName);

			var alertText = $("<p>");

			alertText.text(userName + ", you are Player 2.").appendTo("#user-input");

			choicesToTheDom();
		}

		else {
			alert("Sorry, you'll have to wait! There are two players already.")
		}

		console.log(userName)
	})
})

function choicesToTheDom() {

	$(".rps-div").empty();

	var rps = ["rock", "paper", "scissors"]
	var rpsDiv = $("<div>")

	for (var i = 0; i < 3; i++) {
		$("<p>").text(rps[i]).addClass("rockPaperScissors").appendTo(rpsDiv);
	}

	rpsDiv.appendTo(".rps-div");
}