import { Component, useContext } from 'react'
import UserContext from './../components/UserContext';
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

    handleSubmit(strongestIsStarting) {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: "FACEOFF_START",
            gameCode: this.context.gameCode,
            strongestIsStarting: strongestIsStarting
        });
    }

    render() {
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
                </Container>
            );
        }
        return (
            <Container>
                Faceoff
            </Container>
        );
    }
};