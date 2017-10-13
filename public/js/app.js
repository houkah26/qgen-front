var user; //Global variable to store user
var numCompleted; //number of questions completed
var numQuestions; //total number of questions
var remainingQuestions = []; //Array of remaining unanswered questions
var completedQuestions = []; //Array of completed questions
var currentQuestionIndex; //Store current question index
var address = "https://qgen-back.herokuapp.com";
var baseUrl = address + "/users";

// Event Handlers
$(document).ready(function() {
  $("#logged-in").css("display", "none");
  $("#current-rate").hide();

  // Handle Creating New User
  $("#create-user").on("submit", function(e) {
    e.preventDefault();
    $("#login-form").css("display", "none");
    var username = $("#username-create").val();
    var formData = { userName: username };
    $.ajax({
      type: "POST",
      crossDomain: true,
      url: baseUrl,
      data: JSON.stringify(formData),
      contentType: "application/json",
      dataType: "json"
    }).done(function(data) {
      user = data;
      renderUser(user);
    });
  });

  // Handle Logging in User
  $("#login-user").on("submit", function(e) {
    e.preventDefault();
    $("#login-form").css("display", "none");
    var username = $("#username-login").val();
    var formData = { userName: username };
    $.ajax({
      type: "GET",
      crossDomain: true,
      url: baseUrl,
      dataType: "json"
    }).done(function(data) {
      var users = data;
      for (let i = 0; i < users.length; i++) {
        if (users[i].userName === username) {
          user = users[i];
          break;
        }
      }
      renderUser(user);
    });
  });

  // Generate random unanswered question when button clicked
  $("#Qgen-button").on("click", function(e) {
    // If question hasn't been generated
    // Display first random question
    if (!currentQuestionIndex) {
      //Get/set next random question
      randomQuestionGenerator();
      $("#Qgen-button").html("Mark as Answered and Get Next Question");
    } else {
      // If question has already been generated
      // Mark current question as answered and display next question
      $("#Qgen-button").prop("disabled", true);
      // Send AJAX request to server marking quesiton as answered
      // POST /users/:uID/questions/:qID/answer
      $.ajax({
        type: "POST",
        crossDomain: true,
        url:
          baseUrl +
          "/" +
          user._id +
          "/questions/" +
          remainingQuestions[currentQuestionIndex]._id +
          "/answer",
        dataType: "json"
      }).done(function() {
        numCompleted++;
        completionRate = currentCompletionRate();
        $("#completion-rate").html(completionRate);
        $("#current-rate").show();
        $("#num-completed").html(numCompleted);
        // Add current question to completed list
        var completedQuestionsString = $("#questions-completed").html();
        completedQuestionsString +=
          remainingQuestions[currentQuestionIndex].number + ", ";
        $("#questions-completed").html(completedQuestionsString);
        // Remove current question from remaining list
        remainingQuestions.splice(currentQuestionIndex, 1);
        //Get/set next random question
        randomQuestionGenerator();
        $("#Qgen-button").prop("disabled", false);
      });
    }
  });

  // Handle Manually Answering a Question
  $("#manual-answer").on("submit", function(e) {
    e.preventDefault();
    var answerQuestionNumber = $("#answer-question-number").val();
    var answerQuestionIndex;
    var answerQuestionId;
    for (var i = 0; i < remainingQuestions.length; i++) {
      if (remainingQuestions[i].number === answerQuestionNumber) {
        answerQuestionIndex = i;
        answerQuestionId = remainingQuestions[i]._id;
        break;
      }
    }
    $.ajax({
      type: "POST",
      crossDomain: true,
      url:
        baseUrl + "/" + user._id + "/questions/" + answerQuestionId + "/answer",
      dataType: "json"
    }).done(function() {
      numCompleted++;
      completionRate = currentCompletionRate();
      $("#completion-rate").html(completionRate);
      $("#current-rate").show();
      $("#num-completed").html(numCompleted);
      // Add current question to completed list
      var completedQuestionsString = $("#questions-completed").html();
      completedQuestionsString += answerQuestionNumber + ", ";
      $("#questions-completed").html(completedQuestionsString);
      // Remove current question from remaining list
      remainingQuestions.splice(answerQuestionIndex, 1);
    });
  });
});

// HELPER FUNCTIONS

// Render a logged in user
function renderUser(user) {
  numQuestions = user.questions.length;

  // Populate list of unanswered questions
  for (let i = 0; i < numQuestions; i++) {
    if (!user.questions[i].answered) {
      remainingQuestions.push(user.questions[i]);
    } else {
      completedQuestions.push(user.questions[i].number);
    }
  }

  numCompleted = completedQuestions.length;
  var completedQuestionsString = "";
  for (var i = 0; i < numCompleted; i++) {
    completedQuestionsString += completedQuestions[i] + ", ";
  }
  $("#questions-completed").html(completedQuestionsString);

  $("#num-questions").html(numQuestions);
  $("#num-completed").html(numCompleted);
  $("#username").html(user.userName);
  $("#logged-in").css("display", "block");
}

// Random number function
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get and Set Random Quesiton number
function randomQuestionGenerator() {
  var randomQuestionIndex = getRandomInt(0, remainingQuestions.length - 1);
  var randomQuestionNum = remainingQuestions[randomQuestionIndex].number;
  currentQuestionIndex = randomQuestionIndex;
  $("#current-question-number").html(randomQuestionNum);
}

// Calculate and return current rate of completion in days
function currentCompletionRate() {
  var t1 = new Date(user.createdAt);
  var t2 = new Date();
  var daysElapsed = (t2.getTime() - t1.getTime()) / (1000 * 60 * 60 * 24);
  var completionRate = numCompleted / daysElapsed;
  completionRate = Math.round(completionRate * 100) / 100;
  return completionRate;
}
