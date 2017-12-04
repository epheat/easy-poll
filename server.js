var express = require('express')
var bodyParser = require('body-parser')
var dotenv = require('dotenv').config()
var path = require('path')
var shortid = require('shortid');

var fallback = require('express-history-api-fallback')

// required stuff for authentication
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const cors = require('cors');

// Create an app using Express framework
var app = express()

// Tell express to use the body-parser middleware and to parse extended bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
var corsOptions = {
  allowedHeaders: 'Authorization'
}
app.use(cors(corsOptions));
*/
// https://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// https://auth0.com/blog/vuejs2-authentication-tutorial/
const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://easy-poll.auth0.com/.well-known/jwks.json"
    }),
    // This is the identifier we set when we created the API
    audience: 'http://easy-poll.com',
    issuer: "https://easy-poll.auth0.com/",
    algorithms: ['RS256']
});

var port = process.env.PORT || 8000;
var server = app.listen(port, function () {
  console.log("easy-poll is listening for HTTP requests on port " + port + ".")
});

var root = __dirname + '/public';
// serve all files in the public directory
app.use(express.static(root));
// fallback to index.html
app.use(fallback('index.html', { root: root }));

var io = require('socket.io')(server)
var resultsComSocket = io.of('/resultsCom');  // the socket connection for the results screen

// on connection, set up other listeners
resultsComSocket.on('connection', function(socket) {
  console.log("Client ID "+socket.id+" connected!!");

  socket.on('debug', function(data) {
    console.log(polls);
  })
})

var polls = [
  // WARNING: these all expire soon upon server restart
  new Poll(true, "Should this potential get a bid?", ["Yes", "No", "Abstain"], 60000),
  new Poll(false, "Here's another poll?", ["Maybe", "Sometimes"], 30000),
  new Poll(true, "Finally, another poll prompt", ["Of course", "Not a chance", "NO way", "ehh... Maybe"], 5000)
];

// Poll object constructor.
function Poll(multiple, prompt, responses, duration) {
  this.allowMultiple = multiple;
  this.prompt = prompt;
  this.responses = responses;
  this.duration = duration;
  this.pollID = shortid.generate();
  this.timestamp = Date.now();

  // list of votes from particular accounts.
  this.votes = [];

  // parallel array to responses, represents how many votes each response has
  this.tallies = [];

  for (var i=0; i<responses.length; i++) {
    this.tallies.push(0);
  }

  this.registerVote = function(vote) {
    var foundVoteForThatAccount = false;
    // check if a vote already exists for that account
    for (var i = 0; i < this.votes.length; i++) {
      if (vote.accountID == this.votes[i].accountID) {
        foundVoteForThatAccount = true;
        // console.log("That account already voted. Replacing vote.");
        // decrement the tallies for each response that was voted for previously
        for (var j = 0; j < this.votes[i].selectedResponses.length; j++) {
          if (this.votes[i].selectedResponses[j] == true) {
            this.tallies[j]--;
          }
        }
        this.votes.splice(i, 1, vote); // at position i, remove 1 element and insert vote
      }
    }
    if (!foundVoteForThatAccount) {
      this.votes.push(vote); // no vote found from that accountID, so go ahead and add it
      console.log(`account#${vote.accountID} has voted in poll#${this.pollID}.`);
    }

    // increment tallies for each response from the vote received
    for (var i = 0; i < vote.selectedResponses.length; i++) {
      if (vote.selectedResponses[i] == true) {
        this.tallies[i]++;
      }
    }
  }

  this.getVote = function(accountID) {
    for (var i = 0; i < this.votes.length; i++) {
      if (this.votes[i].accountID = accountID) {
        return this.votes[i];
      }
    }
    return undefined;
  }

  this.expired = function() {
    var expiresAt = +this.timestamp + +this.duration; // unary operator for string->int conversion
    return Date.now() > expiresAt;
  }
}

// Vote object constructor
function Vote(accountID, selectedResponses) {
  this.selectedResponses = selectedResponses;
  this.accountID = accountID;
}


// --------------
// http endpoints
// --------------

// ----- Permission level: admin -----
// get pollResults simply returns the entire currentPoll object
app.post('/pollResults', jwtCheck, function(request, response) {
  var foundPoll = false;
  for (var i=0; i<polls.length; i++) {
    if (polls[i].pollID == request.body.pollID) {
      foundPoll = true;
      response.json(polls[i]);
    }
  }
  if (!foundPoll) {
    response.send("no poll found with that id.");
    console.log("Error: tried to get poll results from poll that does not exist.");
  }
})

app.post('/createPoll', jwtCheck, function(request, response) {
  var poll = new Poll(request.body.poll.allowMultiple, request.body.poll.prompt, request.body.poll.responses, request.body.poll.duration);
  polls.push(poll);
  response.send(poll.pollID);
  console.log(polls);
})

app.post('/deletePoll', jwtCheck, function(request, response) {
  var foundPoll = false;
  for (var i=0; i<polls.length; i++) {
    if (polls[i].pollID == request.body.pollID) {
      foundPoll = true;
      polls.splice(i, 1);
      response.send("Poll Deleted.")
    }
  }
  if (!foundPoll) {
    response.send("Poll not found with that ID.");
  }
})

// ----- Permission level: user -----
// get poll returns all active polls
app.post('/activePolls', jwtCheck, function(request, response) {
  var pollList = [];
  for (var i=0; i<polls.length; i++) {
    if (!polls[i].expired()) {
      // TODO: can I just push polls[i] onto pollList?
      pollList.push({
        prompt: polls[i].prompt,
        responses: polls[i].responses,
        allowMultiple: polls[i].allowMultiple,
        duration: polls[i].duration,
        timestamp: polls[i].timestamp,
        pollID: polls[i].pollID
      })
    }
  }
  // console.log(`Date.now(): ${Date.now()}`);
  // console.log(pollList);
  response.json(pollList);
})

// get all expired polls, to check results of past polls
app.post('/expiredPolls', jwtCheck, function(request, response) {
  var pollList = [];
  for (var i=0; i<polls.length; i++) {
    if (polls[i].expired()) {
      // TODO: can I just push polls[i] onto pollList?
      pollList.push({
        prompt: polls[i].prompt,
        responses: polls[i].responses,
        allowMultiple: polls[i].allowMultiple,
        duration: polls[i].duration,
        timestamp: polls[i].timestamp,
        pollID: polls[i].pollID
      })
    }
  }
  // console.log(`Date.now(): ${Date.now()}`);
  // console.log(polls);
  response.json(pollList);
})

// get all expired polls, to check results of past polls
app.post('/allPolls', jwtCheck, function(request, response) {
  var pollList = [];
  for (var i=0; i<polls.length; i++) {
    pollList.push({
      prompt: polls[i].prompt,
      responses: polls[i].responses,
      allowMultiple: polls[i].allowMultiple,
      duration: polls[i].duration,
      timestamp: polls[i].timestamp,
      pollID: polls[i].pollID
    })
  }
  response.json(pollList);
})


// get poll by id returns only the prompt, responses, and whether the poll allows multiple responses to be selected
app.post('/poll', jwtCheck, function(request, response) {
  var foundPoll = false;
  for (var i=0; i<polls.length; i++) {
    if (polls[i].pollID == request.body.pollID) {
      foundPoll = true;
      response.json({
        prompt: polls[i].prompt,
        responses: polls[i].responses,
        allowMultiple: polls[i].allowMultiple,
        duration: polls[i].duration,
        timestamp: polls[i].timestamp,
        pollID: polls[i].pollID
      });
    }
  }
  if (!foundPoll) {
    response.send("no poll found with that id.");
    console.log("Error: tried to get poll that does not exist.");
  }
})
// post userVote takes an accountID and a pollID as a parameter and returns that particular user's vote (if one exists for that user)
app.post('/userVote', jwtCheck, function(request, response) {
  var foundUserVote = false;
  var pollIndex = -1;
  for (var i=0; i<polls.length; i++) { // first, find the poll with that pollID
    if (polls[i].pollID == request.body.pollID) {
      pollIndex = i;
      break;
    }
  }
  if (pollIndex == -1) {
    console.log("Error: user requested their vote from a nonexistent poll.");
    response.send("Error: requested vote from a nonexistent poll.");
  } else {
    for (var i=0; i<polls[pollIndex].votes.length; i++) {
      if (polls[pollIndex].votes[i].accountID == request.body.accountID) {
        foundUserVote = true;
        response.json(polls[pollIndex].votes[i]);
      }
    }
    if (!foundUserVote) {
      response.send("no vote");
    }
  }
})
// post vote registers a vote from a user
app.post('/vote', jwtCheck, function(request, response) {
  var foundPoll = false;
  var wasExpired = false;
  for (var i=0; i<polls.length; i++) {
    if (polls[i].pollID == request.body.pollID) {
      foundPoll = true;
      if (!polls[i].expired()) {
        polls[i].registerVote(new Vote(request.body.accountID, request.body.selectedResponses));
        resultsComSocket.emit("resultsUpdated", {pollID: polls[i].pollID, poll: polls[i]});
      } else {
        wasExpired = true;
      }
    }
  }
  if (foundPoll) {
    if (wasExpired) {
      response.send("That poll is expired.")
    } else {
      response.send("Your vote has been tallied.");
    }
  } else {
    response.send("That poll does not exist.");
  }
})
