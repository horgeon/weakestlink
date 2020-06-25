import React, { Component, useContext } from 'react'
import UserContext from './components/UserContext';
import { Select, Container, Form, Button } from 'semantic-ui-react'

export default class New extends Component {
    static contextType = UserContext;

    state = {
        gameKind: '',
        gameKinds: [],
        submitted: true
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGameKindChange = this.handleGameKindChange.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        this.context.sendEvent({
            type: "GAME_GET_KINDS"
        });
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case "GAME_KINDS":
                let gameKinds = event.gameKinds.map(kind => { return {key: kind, value: kind, text: kind} });
                this.setState({gameKinds: gameKinds});
                return true;
            case "GAME_CREATED":
                this.context.setContext({gameCode: event.gameCode, game: event.game, gameMaster: true});
                this.context.history.push('/start');
                this.context.history.goForward();
                return true;
            case "ERROR":
                return true;
        }
        return false;
    }

    handleSubmit() {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: "GAME_NEW",
            kind: this.state.gameKind
        });
    }

    handleGameKindChange(event, data) {
        this.setState({gameKind: data.value});
    }

    render() {
        return (
            <Container>
                <Button onClick={() => this.context.history.goBack()}>←</Button>
                <Form inverted onSubmit={this.handleSubmit} loading={this.state.submitted}>
                    <Form.Field>
                        <label>Game kind</label>
                        <Select placeholder='Select game kind' options={this.state.gameKinds} onChange={this.handleGameKindChange} />
                    </Form.Field>
                    <Button type='submit' primary>Create</Button>
                </Form>
            </Container>
        );
    }
};