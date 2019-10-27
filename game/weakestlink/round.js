require('../io');
const Player = require('./player/index');

class Round {
    constructor(configuration) {
        this.type = 'ROUND';
        this.number = configuration.number;
        this.duration_ms = configuration.duration_s * 1000;
        this.bankFillType = configuration.bank.fillType;
        this.bankPreMultiplier = configuration.bank.preMultiplier;
        this.bankGainScaleIndex = 0;
        this.questions = configuration.questions.map;
        this.playerStartType = configuration.players.startType;
        this.answerCorrects = 0;
        this.onEvent = this.onEvent.bind(this);
        this.checkInterval = this.checkInterval.bind(this);
        this.currentQuestion = null;
        const orderedBankScale = {};
        console.log(configuration.bank.gainScale);
        Object.keys(configuration.bank.gainScale).sort().forEach(function(key) {
            orderedBankScale[key] = configuration.bank.gainScale[key];
        });
        this.bankGainScale = Object.values(orderedBankScale);

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
    }

    onEvent(from, event) {
        switch(event.type) {
            case 'ROUND_START':
                this.start();
                return true;
            case 'ROUND_ANSWER_RIGHT':
                this.answerCorrect();
                return true;
            case 'ROUND_ANSWER_WRONG':
                this.answerWrong();
                return true;
            case 'ROUND_BANK':
                this.putInBank();
                return true;
            case 'ROUND_STOP':
                this.stop();
                return true;
            default:
                return false;
        }
    }

    run(game, previousSequences, players) {
        console.log('> ROUND '+this.number+' : RUNNING');
        console.log('# ROUND '+this.number+' : Players :');
        console.log(players);
        switch(this.bankFillType) {
            case 'previous':
                let reversedPreviousSequence = [...previousSequences];
                reversedPreviousSequence.pop();
                reversedPreviousSequence.reverse();
                let previousRound = reversedPreviousSequence.find(seq_elem => seq_elem instanceof Round);
                console.log(previousRound);
                console.log(previousRound.totalBank);
                this.totalBank = ( !isNaN(previousRound.bank) ? this.bankPreMultiplier * previousRound.bank : 0 );
                break;

            default:
                this.totalBank = 0;
                break;
        }
        this.bank = 0;
        this.sendSetUI = game.sendSetUI;
        this.sendEventWithGame = game.sendEventWithGame;
        this.players = [...players];

        switch(this.playerStartType) {
            case 'alphabetical':
                let firstPlayerByName = this.players.reduce((acc, current) => {
                    if(acc.name > current.name)
                        return current;
                    return acc;
                });
                while(this.players[0].id !== firstPlayerByName.id) {
                    this.players.push(this.players.shift());
                }
                break;
            case 'previousStrongest':
                let firstPlayerByScore = this.players.reduce((acc, current) => {
                    if(acc.currentRoundStats.score < current.currentRoundStats.score)
                        return current;
                    return acc;
                });
                while(this.players[0].id !== firstPlayerByScore.id) {
                    this.players.push(this.players.shift());
                }
                break;
        }

        this.players.forEach(player => player.changeRound());
        // If no more players
        if(this.players.length == 0) {
            // Skip section
            gameIO.sendEvent({
                type: 'ERROR',
                msg: 'No more players for round'
            });
            return new Promise(resolve => {
                resolve();
            });
        }
        // Change to pre-round UI
        this.sendSetUI('/round/start');
        // Use promise to make parent function wait
        let obj = this;
        return new Promise(resolve => {
            obj.stopPromise = resolve;
        });
    }

    start() {
        console.log('> ROUND '+this.number+' : STARTED');
        // Start timer
        let timer = setInterval(this.checkInterval, 250);
        // Change to round UI
        this.sendSetUI('/round/run');
        this.timer = timer;
        // Change question
        this.changeQuestion();
    }

    checkInterval() {
        this.duration_ms -= 250;
        if(this.duration_ms <= 0) {
            this.stop();
        } else {
            gameIO.sendEvent({
                type: 'ROUND_TIMER_UPDATE',
                duration_ms: this.duration_ms
            });
        }
    }

    changeQuestion() {
        console.log('# ROUND : Change question');

        // Remove question in front if we need to advance
        if(this.currentQuestion !== null) {
            this.questions.shift();
        }
        // If no more questions, stop round preemptively
        if(this.questions.length == 0) {
            console.log('! ROUND: NO MORE QUESTIONS');
            this.stop();
            return;
        }
        // Get new current question
        this.currentQuestion = this.questions[0];

        let timer = this.timer;
        this.timer = null;
        // Push new question in UI
        this.sendEventWithGame({
            type: 'ROUND_QUESTION_UPDATE',
            question: this.currentQuestion
        });
        this.timer = timer;
    }

    answerCorrect() {
        let shouldStop = false;
        // Increase correct answer amount
        this.answerCorrects++;
        // If we still have steps on the gain scale
        if(this.bankGainScaleIndex < this.bankGainScale.length - 1) {
            // Increase bank amount
            this.bankGainScaleIndex++;
        } else {
            // We are at the top, stop the round
            shouldStop = true;
        }
      
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.answer(true, true);
        // Set other players stats
        this.players.forEach(player => player.currentRoundStats.answer(true, false));
        // Change player
        this.players.push(currentPlayer);
        // Compute player status
        Player.updateStatus(this.players);
        // Change question if we should continue
        if(shouldStop) {
            console.log('# ROUND : Gain scale maxed, stopping round');
            this.putInBank();
        } else {
            this.changeQuestion();
        }
    }

    answerWrong() {
        // Get gains according to scale
        let gains = parseFloat(this.bankGainScale[this.bankGainScaleIndex]);
        // Reset correct answer amount
        this.answerCorrects = 0;
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.answer(false, true);
        currentPlayer.currentRoundStats.moneyLost(gains, true);
        // Set other players stats
        this.players.forEach(player => {
            player.currentRoundStats.answer(false, false)
            player.currentRoundStats.moneyLost(gains, false);
        });
        // Reset gains
        this.bankGainScaleIndex = 0;
        // Change player
        this.players.push(currentPlayer);
        // Compute player status
        Player.updateStatus(this.players);
        // Change question
        this.changeQuestion();
    }

    putInBank() {
        let shouldStop = false;
        // Get gains according to scale
        let gains = parseFloat(this.bankGainScale[this.bankGainScaleIndex]);
        let newBankValue = this.bank + gains;
        console.log("Before condition");
        console.log(this.bank);
        console.log(newBankValue);
        console.log(gains);
        console.log(this.bankGainScaleIndex);
        console.log(this.bankGainScale[this.bankGainScaleIndex]);
        // If the new bank value is higher than the highest scale step
        if(newBankValue >= this.bankGainScale[this.bankGainScale.length - 1]) {
            gains = this.bankGainScale[this.bankGainScale.length - 1] - this.bank;
            newBankValue = this.bankGainScale[this.bankGainScale.length - 1];
            // Stop the round
            shouldStop = true;
        }
        console.log("After condition");
        console.log(this.bank);
        console.log(newBankValue);
        console.log(gains);
        console.log(this.bankGainScaleIndex);
        console.log(this.bankGainScale[this.bankGainScaleIndex]);
        // Put gain in bank
        this.bank = newBankValue;
        this.totalBank += gains;
        // Go back to bottom of gain scale
        this.bankGainScaleIndex = 0;
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.moneyBank(gains, true);
        // Set other players stats
        this.players.forEach(player => player.currentRoundStats.moneyBank(gains, false));
        // Put current player back into the front of player list
        this.players.unshift(currentPlayer);
        // Compute player status
        Player.updateStatus(this.players);
        // Push new values to UI (masqueraded as new question because the UI does not know better)
        let timer = this.timer;
        this.timer = null;
        this.sendEventWithGame({
            type: 'ROUND_QUESTION_UPDATE',
            question: this.currentQuestion
        });
        this.timer = timer;
        // Change question if we should continue
        if(shouldStop) {
            console.log('# ROUND : Gain higher than last scale step, stopping round');
            this.stop();
        }
    }

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        console.log('< ROUND '+this.number+' : STOPPED');
        gameIO.sendEvent({
            type: 'ROUND_STOPPED'
        });
        this.stopPromise();
    }
}

module.exports = Round;
