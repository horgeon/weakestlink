const RoundStat = require('./roundstat');

class Player {
    constructor(id, name) {
        this.name = name;
        this.id = id;
        this.roundstats = [];
    }

    get currentRoundStats() {
        if(this.roundstats.length == 0) {
           this.changeRound();
        }
        return this.roundstats[this.roundstats.length - 1];
    }

    get currentRoundScore() {
        return this.currentRoundStats().score();
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

    changeRound() {
        this.roundstats.push(new RoundStat());
    }
}

module.exports = Player;