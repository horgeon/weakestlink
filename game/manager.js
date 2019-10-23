const WeakestLinkLoader = require('./weakestlink/loader');
require('./io');

class GameManager {
    constructor() {
        this.games = {};
        this.players = {};
        this.onEvent = this.onEvent.bind(this);
        gameIO.onEventCallback = this.onEvent;
    }

    onEvent(from, event) {
        console.log('<= Up event :');
        console.log(event);
        try {
            if(event.gameCode !== undefined && this.games.hasOwnProperty(event.gameCode)) {
                if(this.games[event.gameCode].onEvent(from, event)) {
                    return;
                }
            }

            switch(event.type) {
                case "GAME_GET_KINDS":
                    gameIO.sendEvent(from, {
                        type: 'GAME_KINDS',
                        gameKinds: this.gameGetKinds()
                    });
                    break;
                case "GAME_NEW":
                    this.onGameCreate(from, event);
                    break;
                case "GAME_START":
                    this.onGameStart(from, event);
                    break;
                case "PLAYER_JOIN":
                    this.onPlayerShouldJoin(from, event);
                    break;
            }
        } catch( e ) {
            console.error('Uncaught exception on event processing:');
            console.error(e);
            gameIO.sendEvent(from, {
                type: 'ERROR',
                msg: 'Uncaught error : ' + e,
                playerId: event.playerId
            });
        }
    }

    gameGetKinds() {
        return ['weakestlink'];
    }

    gameCodeGenerate() {
        let code;
        do {
            code = parseInt(Math.floor(1000 + Math.random() * 9000));
        } while(this.games[code] !== undefined);
        return code;
    }

    gameNew(kind) {
        switch(kind) {
            case 'weakestlink':
                let code = this.gameCodeGenerate();
                this.games[code] = WeakestLinkLoader();
                return code;

            default:
                throw "Unknown game";
        }
    }

    gamePlayerCanJoin(gameCode) {
        if(this.games[gameCode] !== undefined) {
            return this.games[gameCode].playerCanJoin();
        }
        return false;
    }

    gamePlayerJoin(gameCode, playerId, playerName) {
        if(this.games[gameCode] !== undefined) {
            return this.games[gameCode].playerJoin(playerId, playerName);
        }
        return null;
    }

    gameCanStart(gameCode) {
        if(this.games[gameCode] !== undefined) {
            return this.games[gameCode].canStart();
        }
        return false;
    }

    gameStart(gameCode) {
        if(this.games[gameCode] !== undefined) {
            this.games[gameCode].run();
            return true;
        }
        return false;
    }

    gameGet(gameCode) {
        return this.games[gameCode];
    }

    playerGet(playerId) {
        return this.players[playerId];
    }

    playerSet(playerId, player) {
        this.players[playerId] = player;
    }

    onGameCreate(from, event) {
        if(event.kind !== null) {
            try {
                let gameCode = this.gameNew(event.kind);
                gameIO.sendEvent(from, {
                    type: 'GAME_CREATED',
                    gameCode: gameCode,
                    game: this.gameGet(gameCode),
                    playerId: event.playerId
                });
            } catch( e ) {
                console.error( e );
                gameIO.sendEvent(from, {
                    type: 'ERROR',
                    msg: 'Cannot create game : ' + e,
                    playerId: event.playerId
                });
            }
        }
    }

    onGameStart(from, event) {
        if(event.gameCode !== null) {
            if(this.gameCanStart(event.gameCode)) {
                if(this.gameStart(event.gameCode)) {
                    gameIO.sendEvent(from, {
                        type: 'GAME_STARTED',
                        gameCode: event.gameCode,
                        playerId: event.playerId,
                        game: this.gameGet(event.gameCode)
                    });
                    return;
                }
            }
            gameIO.sendEvent(from, {
                type: 'ERROR',
                msg: 'Game cannot be started.',
                playerId: event.playerId
            });
        } else {
            gameIO.sendEvent(from, {
                type: 'ERROR',
                msg: 'Invalid game start event.',
                playerId: event.playerId
            });
        }
    }

    onPlayerShouldJoin(from, event) {
        if(event.gameCode !== null && event.playerName !== null) {
            if(this.gamePlayerCanJoin(event.gameCode, event.playerName)) {
                let player = this.gamePlayerJoin(event.gameCode, event.playerId, event.playerName);
                this.playerSet(event.playerId, player);
                gameIO.sendEvent(from, {
                    type: 'GAME_JOINED',
                    gameCode: event.gameCode,
                    playerName: event.playerName,
                    playerId: event.playerId,
                    player: this.playerGet(event.playerId),
                    game: this.gameGet(event.gameCode)
                });
            } else {
                gameIO.sendEvent(from, {
                    type: 'ERROR',
                    msg: 'You cannot join this game.',
                    playerId: event.playerId
                });
            }
        } else {
            gameIO.sendEvent(from, {
                type: 'ERROR',
                msg: 'Invalid join event.',
                playerId: event.playerId
            });
        }
    }
}

module.exports = GameManager;