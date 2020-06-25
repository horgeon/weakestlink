import React, { Component, useContext } from 'react'
import UserContext from './components/UserContext';
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
        if(this.context.gameCode == undefined) {
            this.context.history.push('/');
            this.context.history.goForward();
        }
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'GAME_STARTED':
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
            type: "GAME_START",
            gameCode: this.context.gameCode
        });
    }

    render() {
        if(this.state.started) {
            return (
                <Container>
                    <p>
                        Game code : {this.context.gameCode}
                    </p>
                    <p>
                        Game started, waiting for instructions...
                    </p>
                </Container>
            );
        }
        return (
            <Container>
                <p>
                    Game code : {this.context.gameCode}
                </p>
                <Form inverted onSubmit={this.handleSubmit} loading={this.state.submitted}>
                    <Button type='submit' primary>Start game</Button>
                </Form>
            </Container>
        );
    }
};