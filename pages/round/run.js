import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

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
                return (
                    <Container>
                        <p>Round {this.state.number}</p>
                        <p>Duration {this.state.duration_ms}</p>
                        <p>Question: {JSON.stringify(this.state.question)}</p>
                        <p>Bank : {currentSeq.bank}, answered right: {currentSeq.answerCorrects}</p>
                        <p>Bank scale : {JSON.stringify(currentSeq.bankGainScale)}, current value: {currentSeq.bankGainScale[currentSeq.bankGainScaleIndex]}</p>
                        <Form inverted loading={this.state.submitted}>
                            <p><Button onClick={this.handleRight} color='green'>Right</Button><Button onClick={this.handleWrong} color='red'>Wrong</Button></p>
                            <p><Button onClick={this.handleBank} color='blue'>Bank</Button></p>
                            <p><Button onClick={this.handleStop} color='pink'>Stop</Button></p>
                        </Form>
                    </Container>
                );
            }
            return (
                <Container>
                    <p>Round {this.state.number}</p>
                    <p>Duration {this.state.duration_ms}</p>
                    <p>Bank : {currentSeq.bank}, answered right: {currentSeq.answerCorrects}</p>
                    <p>Bank scale : {JSON.stringify(currentSeq.bankGainScale)}, current value: {currentSeq.bankGainScale[currentSeq.bankGainScaleIndex]}</p>
                </Container>
            );
        }
        return (
            <Container>Waiting...</Container>
        );
    }
};