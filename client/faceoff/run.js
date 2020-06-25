import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Table, Container, Form, Button } from 'semantic-ui-react'

import BankScale from '../../components/BankScale';
import Duration from '../../components/Duration';

export default class Run extends Component {
    static contextType = UserContext;

    state = {
        question: null,
        submitted: false,
        deathmatch: false
    };

    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this.handleRight = this.handleRight.bind(this);
        this.handleWrong = this.handleWrong.bind(this);
        this.handleWin = this.handleWin.bind(this);
        this.sendEvent = this.sendEvent.bind(this);
        this.handleNextQuestion = this.handleNextQuestion.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    handleRight() {
        this.sendEvent('FACEOFF_ANSWER_RIGHT');
    }

    handleWrong() {
        this.sendEvent('FACEOFF_ANSWER_WRONG');
    }

    handleNextQuestion() {
        this.sendEvent('FACEOFF_NEXT_QUESTION');
    }

    handleWin(winnerId) {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: 'FACEOFF_SET_WINNER',
            gameCode: this.context.gameCode,
            winnerId: winnerId
        });
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
            case 'FACEOFF_QUESTION_UPDATE':
                this.setState({question: event.question});
                this.context.setContext({game: event.game});
                return true;
            case 'FACEOFF_DEATHMATCH_START':
                this.setState({deathmatch: true});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

    render() {
        let currentSeq = this.getCurrentSequence();
        if(currentSeq.type === 'FACEOFF') {
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
                        </Table.Row>
                    ));
                });
                let buttons = [];
                if(this.state.deathmatch) {
                    buttons = players.map(player => (
                        <p><Button onClick={() => this.handleWin(player.id)}>{player.name} win</Button></p>
                    ));
                    buttons.push((
                        <p><Button onClick={this.handleNextQuestion} primary>Next question</Button></p>
                    ));
                } else {
                    buttons = [
                        (<p><Button onClick={this.handleRight} color='green'>Right</Button><Button onClick={this.handleWrong} color='red'>Wrong</Button></p>)
                    ];
                }
                return (
                    <Container>
                        <p>Faceoff</p>
                        <p><b>{currentSeq.players !== undefined ? currentSeq.players[0].name : ''}</b></p>
                        <p>Question:</p>
                        <p>
                            <ul>
                                <li>{this.state.question !== null ? this.state.question.q : ''}</li>
                                <li style={{ listStyleType: "square" }}>{this.state.question !== null ? this.state.question.a : ''}</li>
                            </ul>
                        </p>
                        <Form inverted loading={this.state.submitted}>
                            {buttons}
                        </Form>
                        <p>Stats</p>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Score</Table.HeaderCell>
                                    <Table.HeaderCell>Answers</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {stats}
                            </Table.Body>
                        </Table>
                    </Container>
                );
            }
            if(this.state.deathmatch) {
                return (
                    <Container>
                        <p>Faceoff — <b>Deathmatch</b></p>
                    </Container>
                );
            } else {
                return (
                    <Container>
                        <p>Faceoff</p>
                        <p><b>{currentSeq.players !== undefined ? currentSeq.players[0].name : ''}</b></p>
                    </Container>
                );
            }
        }
        return (
            <Container>Waiting...</Container>
        );
    }
};