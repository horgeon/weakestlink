require('../io');
const Player = require('./player/index');
const Round = require('./round');

class Faceoff {
    constructor(configuration) {
        this.type = 'FACEOFF';
<<<<<<< HEAD
        this.questions = configuration.questions;
        this.consecutiveAnswers = 0;
        this.currentQuestion = null;
=======
        this.questions = configuration.questions.map;
        this.consecutiveAnswers = {};
        this.currentQuestion = null;
        this.players = [];
>>>>>>> 26102019-prod
        this.bank = 0;
        this.played = {};
        this.deathmatch = false;
        this.onEvent = this.onEvent.bind(this);
        this.stop = this.stop.bind(this);
<<<<<<< HEAD
=======
        if(configuration.questions.order === 'random') {
            this.shuffleQuestions();
        }
    }

    shuffleQuestions() {
        let currentIndex = this.questions.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this.questions[currentIndex];
        this.questions[currentIndex] = this.questions[randomIndex];
        this.questions[randomIndex] = temporaryValue;
        }
>>>>>>> 26102019-prod
    }

    onEvent(from, event) {
        switch(event.type) {
            case 'FACEOFF_START':
                this.start(event.strongestIsStarting);
                return true;
            case 'FACEOFF_ANSWER_RIGHT':
                this.answerCorrect();
                return true;
            case 'FACEOFF_ANSWER_WRONG':
                this.answerWrong();
                return true;
            case 'FACEOFF_NEXT_QUESTION':
                this.changeQuestion();
                return true;
            case 'FACEOFF_SET_WINNER':
                this.setWinner(event.winnerId);
                return true;
            default:
                return false;
        }
    }

    run(game, previousSequences, players) {
        console.log('> FACEOFF : RUNNING');
        console.log('# FACEOFF : Players :');
        console.log(players);
        let reversedPreviousSequence = [...previousSequences];
        reversedPreviousSequence.reverse();
        let previousRound = reversedPreviousSequence.find(seq_elem => seq_elem instanceof Round);
<<<<<<< HEAD
        this.bank = ( !isNaN(previousRound.bank) ? previousRound.bank : 0 );
=======
        this.bank = ( !isNaN(previousRound.totalBank) ? previousRound.totalBank : 0 );
>>>>>>> 26102019-prod
        this.sendSetUI = game.sendSetUI;
        this.sendEventWithGame = game.sendEventWithGame;
        this.players = [...players];
        // Sort so that the strongest link is first
        this.players.sort((a, b) =>  b.currentRoundStats.score - a.currentRoundStats.score);
        this.players.forEach(player => player.changeRound());
        this.players.forEach(player => {
            this.played[player.id] = false;
<<<<<<< HEAD
=======
            this.consecutiveAnswers[player.id] = 0;
>>>>>>> 26102019-prod
        });
        // If no more players
        if(this.players.length == 0) {
            // Skip section
            gameIO.sendEvent({
                type: 'ERROR',
                msg: 'No more players for faceoff'
            });
            return new Promise(resolve => {
                resolve();
            });
        }
        // Change to pre-faceoff UI
        this.sendSetUI('/faceoff/start');
        // Use promise to make parent function wait
        let obj = this;
        return new Promise(resolve => {
            obj.stopPromise = resolve;
        });
    }

    start(strongestIsStarting) {
        console.log('> FACEOFF : STARTED');
        console.log('- Strongest is starting:' + strongestIsStarting);
        // If the strongest is not starting
        if(!strongestIsStarting) {
            // Put the last player in the list (weakest) at the front (player who starts)
            let weakest = this.players.pop();
            this.players.unshift(weakest);
        }
        // Change to round UI
        this.sendSetUI('/faceoff/run');
        // Change question
        this.changeQuestion();
    }

    changeQuestion() {
        console.log('# FACEOFF : Change question');
        // Remove question in front if we need to advance
        if(this.currentQuestion !== null) {
            this.questions.shift();
        }
        // If no more questions
        if(this.questions.length == 0) {
            // If not in deathmatch, go to deathmatch
            if(!this.deathmatch) {
                console.log('! FACEOFF: NO MORE QUESTIONS');
                // Go to deathmatch
                this.deathmatch = true;
                this.sendEventWithGame({
                    type: 'FACEOFF_DEATHMATCH_START'
                });
                gameIO.sendEvent({
                    type: 'ERROR',
                    msg: 'No more question, please pick a winner (going to deathmatch)'
                });
            } else {
                console.log('! FACEOFF: NO MORE QUESTIONS');
                // Inform that there is no more questions
                gameIO.sendEvent({
                    type: 'ERROR',
                    msg: 'No more questions, please pick a winner'
                });
            }
            return;
        }
        // Get new current question
        this.currentQuestion = this.questions[0];

        // Push new question in UI
        this.sendEventWithGame({
            type: 'FACEOFF_QUESTION_UPDATE',
            question: this.currentQuestion
        });
    }

    answerCorrect() {
<<<<<<< HEAD
        // Increase consecutive answers amount
        this.consecutiveAnswers++;
        // Get current player
        let currentPlayer = this.players.shift();
=======
        // Get current player
        let currentPlayer = this.players.shift();
        // Increase consecutive answers amount
        this.consecutiveAnswers[currentPlayer.id]++;
>>>>>>> 26102019-prod
        // Set current player stats
        currentPlayer.currentRoundStats.answer(true, true);
        // Set other players stats
        this.players.forEach(player => player.currentRoundStats.answer(true, false));
        // If we have 5 consecutive answers and we're not in deathmatch
<<<<<<< HEAD
        if(this.consecutiveAnswers >= 5 && this.deathmatch === false) {
            // Change player
            this.players.push(currentPlayer);
            // Reset consecutive answers
            this.consecutiveAnswers = 0;
            // Set that the current player played
            this.played[currentPlayer.id] = true;
        } else {
            // Use same player
            this.players.unshift(currentPlayer);
        }
=======
        if(this.consecutiveAnswers[currentPlayer.id] >= 5 && this.deathmatch === false) {
            // Set that the current player played
            this.played[currentPlayer.id] = true;
        }
        // Change player
        this.players.push(currentPlayer);
>>>>>>> 26102019-prod
        // Compute player status
        Player.updateStatus(this.players);
        // Check deathmatch
        this.checkDeathmatch();
        // Change question
        this.changeQuestion();
    }

    answerWrong() {
<<<<<<< HEAD
        // Increase consecutive answers amount
        this.consecutiveAnswers++;
        // Get current player
        let currentPlayer = this.players.shift();
=======
        // Get current player
        let currentPlayer = this.players.shift();
        // Increase consecutive answers amount
        this.consecutiveAnswers[currentPlayer.id]++;
>>>>>>> 26102019-prod
        // Set current player stats
        currentPlayer.currentRoundStats.answer(false, true);
        // Set other players stats
        this.players.forEach(player => {
            player.currentRoundStats.answer(false, false)
        });
        // If we have 5 consecutive answers and we're not in deathmatch
<<<<<<< HEAD
        if(this.consecutiveAnswers >= 5 && this.deathmatch === false) {
            // Change player
            this.players.push(currentPlayer);
            // Reset consecutive answers
            this.consecutiveAnswers = 0;
            // Set that the current player played
            this.played[currentPlayer.id] = true;
        } else {
            // Use same player
            this.players.unshift(currentPlayer);
        }
=======
        if(this.consecutiveAnswers[currentPlayer.id] >= 5 && this.deathmatch === false) {
            // Set that the current player played
            this.played[currentPlayer.id] = true;
        }
        // Change player
        this.players.push(currentPlayer);
>>>>>>> 26102019-prod
        // Compute player status
        Player.updateStatus(this.players);
        // Check deathmatch
        this.checkDeathmatch();
        // Change question
        this.changeQuestion();
    }

    checkDeathmatch() {
        // Check if all players have played
        let allPlayed = true;
        for(let index in this.played) {
            if(this.played.hasOwnProperty(index)) {
                let hasPlayed = this.played[index];
                if(!hasPlayed) {
                    allPlayed = false;
                }
            }
        }
        // If all players have played
        if(allPlayed) {
            console.log('- All players played');
            // Calculate answer score for both players
            let p1score = this.players[0].currentRoundStats.answers.good - this.players[0].currentRoundStats.answers.bad;
            let p2score = this.players[this.players.length - 1].currentRoundStats.answers.good - this.players[this.players.length - 1].currentRoundStats.answers.bad;
            // If they have the same score
            console.log('P1: ' + p1score + ' / P2: ' + p2score);
            if(p1score === p2score) {
                console.log('# FACEOFF: Go to deathmatch');
                // Go to deathmatch
                this.deathmatch = true;
                this.sendEventWithGame({
                    type: 'FACEOFF_DEATHMATCH_START'
                });
            } else {
                // Set winner
                if(p1score > p2score) {
                    console.log('- '+this.players[0].name+' is winner');
                    this.setWinner(this.players[0].id);
                } else {
                    console.log('- '+this.players[this.players.length - 1].name+' is winner');
                    this.setWinner(this.players[this.players.length - 1].id);
                }
                // Stop
                this.stop();
            }
        }
    }

    setWinner(winnerId) {
        // Set winner
        this.players.forEach(player => {
            player.isWinner = (player.id === winnerId);
            console.log('- '+player.name+' is winner');
        })
        // Stop
        this.stop();
    }

    stop() {
        console.log('< FACEOFF : STOPPED');
        this.sendSetUI('/win');
        this.stopPromise();
    }
}

<<<<<<< HEAD
module.exports = Faceoff;
=======
module.exports = Faceoff;
>>>>>>> 26102019-prod
