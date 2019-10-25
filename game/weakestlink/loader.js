const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const Game = require('./game');
const Round = require('./round');
const Vote = require('./vote');

const configFilePath = path.resolve(__dirname, 'configuration.yml');
const questionsFilePath = path.resolve(__dirname, 'questions.yml');

function parseRoundSequence(sequenceIndex, sequenceDescriptionObject, questions) {
    return new Round({
        number: sequenceDescriptionObject.number,
        duration_s: sequenceDescriptionObject.duration_s,
        bank: sequenceDescriptionObject.bank,
        questions: questions[sequenceDescriptionObject.number - 1]
    });
}

function parseVoteSequence(sequenceIndex, sequenceDescriptionObject) {
    return new Vote({
        player: sequenceDescriptionObject.player
    });
}

function parseSequence(sequenceIndex, sequenceDescriptionObject, questions) {
    switch(sequenceDescriptionObject.type) {
        case 'ROUND':
            return parseRoundSequence(sequenceIndex, sequenceDescriptionObject, questions);
        case 'VOTE':
            return parseVoteSequence(sequenceIndex, sequenceDescriptionObject);
        default:
            throw 'Invalid type for sequence ' + sequenceIndex;
    }
}

function parseConfiguration(config, questions) {
    let gameConfig = {
        sequences: [],
        players: {
            max: config.players.max
        }
    };

    config.sequences.forEach((sequence, index) => {
        gameConfig.sequences.push(parseSequence(index, sequence, questions));
    });

    return gameConfig;
}

module.exports = function() {
    let config = yaml.safeLoad(fs.readFileSync(configFilePath, 'utf8'));
    let questions = yaml.safeLoad(fs.readFileSync(questionsFilePath, 'utf8'));
    let gameConfiguration = parseConfiguration(config, questions);
    return new Game(gameConfiguration);
};