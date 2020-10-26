const RoundStat = require('./roundstat');

class Player {
    constructor(id, name) {
        this.name = name;
        this.id = id;
        this.roundstats = [];
        this.currentRoundStats = [];
        this.currentStatus = '';
    }

    get currentAllTimeStats() {
        if(this.roundstats.length > 0) {
            return this.roundstats.reduce((acc, current) => acc = acc.add(current));
        }
        return new RoundStat();
    }

    get currentAllTimeScore() {
        return this.currentAlltimeStats().score();
    }

    static updateStatus(players) {
        let sortedPlayers = [...players];
        sortedPlayers.forEach(player => player.currentStatus = '');
        sortedPlayers.sort((a, b) =>  b.currentRoundStats.score - a.currentRoundStats.score);
        sortedPlayers.filter(player => player.currentRoundStats.score === sortedPlayers[0].currentRoundStats.score).forEach(player => player.currentStatus = 'Strongest Link');
        sortedPlayers.filter(player => player.currentRoundStats.score === sortedPlayers[sortedPlayers.length - 1].currentRoundStats.score).forEach(player => player.currentStatus = 'Weakest Link');
    }

    changeRound() {
        this.roundstats.push(new RoundStat());
        this.currentRoundStats = this.roundstats[this.roundstats.length - 1];
    }
}

module.exports = Player;