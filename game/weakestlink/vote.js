require('../io');

class Vote {
    constructor(configuration) {
        this.type = 'VOTE';
        this.numberToExclude = configuration.player.numberToExclude;
<<<<<<< HEAD
=======
        this.manual = configuration.manual || false;
>>>>>>> 26102019-prod
        this.votes = {};
        this.excludedPlayers = [];
        this.playersThatVoted = {};
        this.onVote = this.onVote.bind(this);
        this.onVoteReveal = this.onVoteReveal.bind(this);
        this.stop = this.stop.bind(this);
    }

    onEvent(from, event) {
        switch(event.type) {
            case 'VOTE_PLAYER':
                this.onVote(from, event);
                return true;
<<<<<<< HEAD
=======
            case 'VOTE_PLAYER_ADD':
                this.votes[event.votedPlayerId]++;
                this.sendEventWithGame({
                    type: 'VOTE_PLAYER_MODIFIED',
                    votedPlayerId: event.votedPlayerId
                });
                return true;
            case 'VOTE_PLAYER_REMOVE':
                if(this.votes[event.votedPlayerId] > 0) {
                    this.votes[event.votedPlayerId]--;
                }
                this.sendEventWithGame({
                    type: 'VOTE_PLAYER_MODIFIED',
                    votedPlayerId: event.votedPlayerId
                });
                return true;
            case 'VOTE_PLAYER_ELIMINATE':
                let alreadyEliminated = this.excludedPlayers.find(player => player.id == event.eliminatedPlayerId);
                let player = this.players.find(player => player.id == event.eliminatedPlayerId);
                if(alreadyEliminated === undefined && player !== undefined) {
                    this.excludedPlayers.push(player);
                }
                this.sendEventWithGame({
                    type: 'VOTE_PLAYER_MODIFIED',
                    votedPlayerId: event.votedPlayerId
                });
                return true;
>>>>>>> 26102019-prod
            case 'VOTE_REVEAL':
                this.onVoteReveal();
                return true;
            case 'VOTE_STOP':
                this.stop();
                return true;
            default:
                return false;
        }
    }

    run(game, previousSequences, players) {
        let obj = this;
        console.log('> VOTE '+this.number+' : RUNNING');
        console.log('# VOTE '+this.number+' : Players :');
        this.sendSetUI = game.sendSetUI;
        this.sendEventWithGame = game.sendEventWithGame;
        this.players = players;
        this.players.forEach(players => {
            obj.votes[players.id] = 0;
        });
        this.players.forEach(players => {
            obj.playersThatVoted[players.id] = 0;
        });
        // Change to vote UI
<<<<<<< HEAD
        this.sendSetUI('/vote/vote');
=======
        if(this.manual) {
            this.sendSetUI('/vote/manual');
        } else {
            this.sendSetUI('/vote/vote');
        }
>>>>>>> 26102019-prod
        // Use promise to make parent function wait
        return new Promise(resolve => {
            obj.stopPromise = resolve;
        });
    }

    onVote(from, event) {
        if(this.playersThatVoted[event.playerId] < this.numberToExclude) {
            this.votes[event.votedPlayerId]++;
            this.playersThatVoted[event.playerId]++;
            this.sendEventWithGame({
                type: 'VOTE_PLAYER_MODIFIED',
                votedPlayerId: event.votedPlayerId
            });
        } else {
            gameIO.sendEvent(from, {
                type: 'VOTE_PLAYER_REFUSED',
                votedPlayerId: event.votedPlayerId
            });
        }
        this.checkIfDone();
    }

    onVoteReveal() {
        console.log('# VOTE : Reveal');
<<<<<<< HEAD
        let sortedVotes = [];
        for (let index in this.votes) {
            if(this.votes.hasOwnProperty(index)) {
                sortedVotes.push([index, this.votes[index]]);
            }
        }
        sortedVotes.sort((a, b) => b[1] - a[1]);
        let finalVotes = sortedVotes.slice(0, this.numberToExclude);
        this.excludedPlayers = [];
        finalVotes.forEach(votePair => {
            this.players.forEach(player => {
                if(player.id === votePair[0]) {
                    this.excludedPlayers.push(player);
                }
            });
        });
=======
        if(!this.manual) {
            let sortedVotes = [];
            for (let index in this.votes) {
                if(this.votes.hasOwnProperty(index)) {
                    sortedVotes.push([index, this.votes[index]]);
                }
            }
            sortedVotes.sort((a, b) => b[1] - a[1]);
            let finalVotes = sortedVotes.slice(0, this.numberToExclude);
            this.excludedPlayers = [];
            finalVotes.forEach(votePair => {
                this.players.forEach(player => {
                    if(player.id === votePair[0]) {
                        this.excludedPlayers.push(player);
                    }
                });
            });
        }
>>>>>>> 26102019-prod
        console.log(this.excludedPlayers);
        this.sendSetUI('/vote/reveal');
    }

    checkIfDone() {
        let done = true;
        for(let index in this.playersThatVoted) {
            if (this.playersThatVoted.hasOwnProperty(index)) {
                let value = this.playersThatVoted[index];
                if(value < this.numberToExclude) {
                    done = false;
                }
            }
        }
        if(done) {
            this.sendEventWithGame({
                type: 'VOTE_PLAYER_DONE'
            });
        }
    }

    stop() {
        console.log('< VOTE '+this.number+' : STOPPED');
        this.excludedPlayers.forEach(excludedPlayer => {
            let index = -1;
            this.players.forEach((player, i) => {
                if(player.id == excludedPlayer.id)
                    index = i;
            });
            this.players.splice(index, 1);
        });
        gameIO.sendEvent({
            type: 'VOTE_STOPPED'
        });
        this.stopPromise();
    }
}

module.exports = Vote;