import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

export default class Start extends Component {
    static contextType = UserContext;

    state = {
        submitted: false,
        started: false,
        number: NaN
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let currentSeq = this.getCurrentSequence();
        this.setState({number: currentSeq.number});
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'ROUND_STARTED':
                this.setState({started: true});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

    handleSubmit() {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: "ROUND_START",
            gameCode: this.context.gameCode
        });
    }

    render() {
        if(this.state.started) {
            return (
                <Container>
                    <p>
                        Round started...
                    </p>
                </Container>
            );
        }
        if(this.context.gameMaster || this.context.gameAssistant) {
            return (
                <Container>
                    Round {this.state.number}
                    <Form inverted onSubmit={this.handleSubmit} loading={this.state.submitted}>
                        <Button type='submit' primary>Start</Button>
                    </Form>
                </Container>
            );
        }
        return (
            <Container>
                Round {this.state.number}
            </Container>
        );
    }
};