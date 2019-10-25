class RoundStat {
    constructor() {
        this.player = {
            money: {
                banked: 0,
                lost: 0
            },
            answers: {
                good: 0,
                bad: 0
            }
        };
        this.round = {
            money: {
                banked: 0,
                lost: 0
            },
            answers: {
                good: 0,
                bad: 0
            }
        };
        this.score = 0;
    }

    clone() {
        let newStats = new RoundStat();
        newStats.player = this.player;
        newStats.round = this.round;
        newStats.score = this.score;
    }

    moneyBank(amount, forPlayer = true) {
        if(forPlayer) {
            this.player.money.banked += amount;
        }
        this.round.money.banked += amount;
        this.computeScore();
    }

    moneyLost(amount, forPlayer = true) {
        if(forPlayer) {
            this.player.money.lost += amount;
        }
        this.round.money.lost += amount;
        this.computeScore();
    }

    answer(isGoodAnswer, forPlayer = true) {
        if(isGoodAnswer) {
            if(forPlayer) {
                this.player.answers.good++;
            }
            this.round.answers.good++;
        } else {
            if(forPlayer) {
                this.player.answers.bad++;
            }
            this.round.answers.bad++;
        }
        this.computeScore();
    }

    get money() {
        return this.player.money;
    }

    get answers() {
        return this.player.answers;
    }

    computeScore() {
        this.score = this.player.answers.good / ( this.round.answers.good + this.round.answers.bad ) + this.player.money.banked + this.round.money.banked;
    }

    add(stat) {
        newStats = this.clone();
        newStats.player.money.banked += stat.player.money.banked;
        newStats.player.money.lost += stat.player.money.lost;
        newStats.player.answers.good += stat.player.answers.good;
        newStats.player.answers.bad += stat.player.answers.bad;
        newStats.round.money.banked += stat.round.money.banked;
        newStats.round.money.lost += stat.round.money.lost;
        newStats.round.answers.good += stat.round.answers.good;
        newStats.round.answers.bad += stat.round.answers.bad;
        newStats.computeScore();
        return newStats;
    }
}

module.exports = RoundStat;