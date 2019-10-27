const Round = require('./round');
const Player = require('./player');

class Game {
    constructor(configuration) {
        console.log(configuration);
        this.sequences = configuration.sequences;
        this.previousSequences = [];
        this.players = [];
        this.playersMax = configuration.players.max;
        this.sendSetUI = this.sendSetUI.bind(this);
        this.sendEventWithGame = this.sendEventWithGame.bind(this);
        this.onEvent = this.onEvent.bind(this);
        this.currentSequence = null;
        if(configuration.players.names !== undefined) {
            configuration.players.names.forEach((playerName, index) => {
                this.playerJoin('PRELOADED_' + index, playerName);
            });
        }
    }

    playerCanJoin() {
        return this.players.length < this.playersMax;
    }

    playerJoin(playerId, playerName) {
        console.log('# GAME : Player ' + playerName + ' joined');
        let player = new Player(playerId, playerName);
        this.players.push(player);
        return player;
    }

    canStart() {
        console.log('# GAME : Players : ' + this.players.length+ '/' + this.playersMax);
        console.log('- Can start: ' + (this.players.length >= this.playersMax) );
        return this.players.length >= this.playersMax;
    }

    async run() {
        console.log('> GAME : RUNNING');
        while(this.sequences.length > 0) {
            this.currentSequence = this.sequences.shift();
            this.previousSequences.push(this.currentSequence);
            await this.currentSequence.run(this, this.previousSequences, this.players);
        }
    }

    onEvent(from, event) {
        switch(event.type) {
            case 'GAME_GET':
                gameIO.sendEvent(from, {
                    type: 'GAME_PUSH',
                    game: this,
                    gameCode: event.gameCode
                });
                return true;
            default:
                if(this.currentSequence !== null) {
                    return this.currentSequence.onEvent(from, event);
                }
                break;
        }
        return false;
    }

    sendSetUI(path) {
        gameIO.sendEvent({
            type: 'SET_UI',
            game: this,
            path: path
        });
    }

    sendEventWithGame(event) {
        gameIO.sendEvent(Object.assign(event, {
            game: this
        }));
    }
}

module.exports = Game;