import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Table, Container, Form, Button } from 'semantic-ui-react'

import BankScale from '../../components/BankScale';
import Duration from '../../components/Duration';

export default class Run extends Component {
    static contextType = UserContext;

    state = {
        question: null,
        duration_ms: 0,
        number: -1,
        submitted: false
    };

    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this.handleBank = this.handleBank.bind(this);
        this.handleRight = this.handleRight.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleWrong = this.handleWrong.bind(this);
        this.sendEvent = this.sendEvent.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let currentSeq = this.getCurrentSequence();
        this.setState({duration_ms: currentSeq.duration_ms, number: currentSeq.number});
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    handleRight() {
        this.sendEvent('ROUND_ANSWER_RIGHT');
    }

    handleWrong() {
        this.sendEvent('ROUND_ANSWER_WRONG');
    }

    handleBank() {
        this.sendEvent('ROUND_BANK');
    }

    handleStop() {
        this.sendEvent('ROUND_STOP');
    }

    sendEvent(type) {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: type,
            gameCode: this.context.gameCode
        });
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'ROUND_QUESTION_UPDATE':
                this.setState({question: event.question});
                this.context.setContext({game: event.game});
                return true;
            case 'ROUND_TIMER_UPDATE':
                this.setState({duration_ms: event.duration_ms});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

    render() {
        let currentSeq = this.getCurrentSequence();
        if(currentSeq.type === 'ROUND') {
            if(this.context.gameMaster || this.context.gameAssistant) {
                let stats = [];
                let players = [...currentSeq.players];
                players.sort((a, b) =>  b.currentRoundStats.score - a.currentRoundStats.score);
                players.forEach(player => {
                    stats.push((
                        <Table.Row>
                            <Table.Cell>{player.name}</Table.Cell>
                            <Table.Cell>{player.currentRoundStats.score} {player.currentStatus}</Table.Cell>
                            <Table.Cell>+{player.currentRoundStats.player.answers.good}/-{player.currentRoundStats.player.answers.bad}</Table.Cell>
                            <Table.Cell>+{player.currentRoundStats.player.money.banked}/-{player.currentRoundStats.player.money.lost}</Table.Cell>
                        </Table.Row>
                    ));
                });
                return (
                    <Container>
                        <p>Round {this.state.number} — <Duration value={this.state.duration_ms} /></p>
                        <p><b>{currentSeq.players !== undefined ? currentSeq.players[0].name : ''}</b></p>
                        <p>Question:</p>
                        <p>
                            <ul>
                                <li>{this.state.question !== null ? this.state.question.q : ''}</li>
                                <li style={{ listStyleType: "square" }}>{this.state.question !== null ? this.state.question.a : ''}</li>
                            </ul>
                        </p>
                        <p>Bank : {currentSeq.bank}, answered right: {currentSeq.answerCorrects}</p>
                        <BankScale scale={currentSeq.bankGainScale} index={currentSeq.bankGainScaleIndex} isVertical={false} />
                        <Form inverted loading={this.state.submitted}>
                            <p><Button onClick={this.handleRight} color='green'>Right</Button><Button onClick={this.handleWrong} color='red'>Wrong</Button></p>
                            <p><Button onClick={this.handleBank} color='blue'>Bank</Button></p>
                            <p><Button onClick={this.handleStop} color='pink'>Stop</Button></p>
                        </Form>
                        <p>Stats</p>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Score</Table.HeaderCell>
                                    <Table.HeaderCell>Answers</Table.HeaderCell>
                                    <Table.HeaderCell>Money</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {stats}
                            </Table.Body>
                        </Table>
                    </Container>
                );
            }
            return (
                <Container>
                    <p>Round {this.state.number} — <Duration value={this.state.duration_ms} /></p>
                    <p><b>{currentSeq.players !== undefined ? currentSeq.players[0].name : ''}</b></p>
<<<<<<< HEAD
                    <BankScale scale={currentSeq.bankGainScale} index={currentSeq.bankGainScaleIndex} />
=======
                    <BankScale scale={currentSeq.bankGainScale} index={currentSeq.bankGainScaleIndex} isVertical={false} />
>>>>>>> 26102019-prod
                    <p>Bank : {currentSeq.bank}</p>
                </Container>
            );
        }
        return (
            <Container>Waiting...</Container>
        );
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> 26102019-prod
