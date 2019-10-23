require('../io');

class Round {
    constructor(configuration) {
        this.number = configuration.number;
        this.duration_ms = configuration.duration_s * 1000;
        this.bankFillType = configuration.bank.fillType;
        this.bankPreMultiplier = configuration.bank.preMultiplier;
        this.bankGainScaleIndex = 0;
        this.questions = configuration.questions;
        this.anwserCorrects = 0;
        this.onEvent = this.onEvent.bind(this);
        this.checkInterval = this.checkInterval.bind(this);
        this.currentQuestion = null;
        const orderedBankScale = {};
        console.log(configuration.bank.gainScale);
        Object.keys(configuration.bank.gainScale).sort().forEach(function(key) {
            orderedBankScale[key] = configuration.bank.gainScale[key];
        });
        this.bankGainScale = Object.values(orderedBankScale);
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
                let previousRound = previousSequences.slice(0).reverse().find(seq_elem => seq_elem instanceof Round);
                this.bank = ( !isNaN(previousRound.bank) ? this.bankPreMultiplier * previousRound.bank : 0 );
                break;

            default:
                this.bank = 0;
                break;
        }
        this.sendSetUI = game.sendSetUI;
        this.sendEventWithGame = game.sendEventWithGame;
        this.players = players;
        this.players.forEach(player => player.changeRound());
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
        // If we have 9 consecutive correct answers, stop
        if(this.answerCorrect >= 9) {
            this.stop();
        }
        // Remove question in front if we need to advance
        if(this.currentQuestion !== null) {
            this.questions.shift();
        }
        // If no more questions, stop round preemptively
        if(this.questions.length == 0) {
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
        // Increase correct answer amount
        this.answerCorrects++;
        // Increase bank amount
        if(this.bankGainScaleIndex < this.bankGainScale.length - 1)
            this.bankGainScaleIndex++;
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.answer(true, true);
        // Set other players stats
        this.players.forEach(player => player.currentRoundStats.answer(true, false));
        // Change player
        this.players.push(currentPlayer);
        // Change question
        this.changeQuestion();
    }

    answerWrong() {
        // Reset correct answer amount
        this.answerCorrects = 0;
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.answer(false, true);
        currentPlayer.currentRoundStats.moneyLost(this.cummulatedGains, true);
        // Set other players stats
        this.players.forEach(player => {
            player.currentRoundStats.answer(false, false)
            player.currentRoundStats.moneyLost(this.cummulatedGains, false);
        });
        // Reset gains
        this.bankGainScaleIndex = 0;
        // Change player
        this.players.push(currentPlayer);
        // Change question
        this.changeQuestion();
    }

    putInBank() {
        // Put gain in bank
        this.bank += this.bankGainScale[this.bankGainScaleIndex];
        // Go back to bottom of gain scale
        this.bankGainScaleIndex = 0;
        // Get current player
        let currentPlayer = this.players.shift();
        // Set current player stats
        currentPlayer.currentRoundStats.moneyBank(this.cummulatedGains, true);
        // Set other players stats
        this.players.forEach(player => player.currentRoundStats.moneyBank(this.cummulatedGains, false));
        // Put current player back into the front of player list
        this.players.unshift(currentPlayer);
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