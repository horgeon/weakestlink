import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

export default class Start extends Component {
    static contextType = UserContext;

    state = {
        submitted: false,
        started: false
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
<<<<<<< HEAD
=======
        let currentSeq = this.getCurrentSequence();
        this.context.setContext({bank: currentSeq.bank});
>>>>>>> 26102019-prod
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'FACEOFF_STARTED':
                this.setState({started: true});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

<<<<<<< HEAD
=======
    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

>>>>>>> 26102019-prod
    handleSubmit(strongestIsStarting) {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: "FACEOFF_START",
            gameCode: this.context.gameCode,
            strongestIsStarting: strongestIsStarting
        });
    }

    render() {
<<<<<<< HEAD
        if(this.state.started) {
            return (
                <Container>
                    <p>
                        Faceoff started...
                    </p>
                </Container>
            );
        }
        if(this.context.gameMaster || this.context.gameAssistant) {
            return (
                <Container>
                    Faceoff
                    <Form inverted loading={this.state.submitted}>
                        <Button onClick={() => this.handleSubmit(true)}>Strongest start</Button>
                        <Button onClick={() => this.handleSubmit(false)}>Other start</Button>
                    </Form>
=======
        let currentSeq = this.getCurrentSequence();
        if(currentSeq.type === 'FACEOFF') {
            if(this.state.started) {
                return (
                    <Container>
                        <p>
                            Faceoff started...
                        </p>
                    </Container>
                );
            }
            let stats = [];
            let players = [...currentSeq.players];
            players.sort((a, b) =>  b.currentRoundStats.score - a.currentRoundStats.score);
            players.forEach(player => {
                stats.push((
                    <li>{player.name} {player.currentStatus}</li>
                ));
            });
            if(this.context.gameMaster || this.context.gameAssistant) {
                return (
                    <Container>
                        Faceoff
                        <p>Bank: {currentSeq.bank}</p>
                        <p>Players:</p>
                        <ul>
                            {stats}
                        </ul>
                        <Form inverted loading={this.state.submitted}>
                            <Button onClick={() => this.handleSubmit(true)}>Strongest start</Button>
                            <Button onClick={() => this.handleSubmit(false)}>Other start</Button>
                        </Form>
                    </Container>
                );
            }
            return (
                <Container>
                    Faceoff
                    <p>Bank: {currentSeq.bank}</p>
                    <p>Players:</p>
                    <ul>
                        {stats}
                    </ul>
>>>>>>> 26102019-prod
                </Container>
            );
        }
        return (
<<<<<<< HEAD
            <Container>
                Faceoff
            </Container>
        );
    }
};
=======
            <Container>Waiting...</Container>
        );
    }
};
>>>>>>> 26102019-prod
