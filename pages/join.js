import { Component, useContext } from 'react'
import UserContext from '../components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

import Router from 'next/router'

export default class Join extends Component {
    static contextType = UserContext;

    state = {
        gameCode: '',
        playerName: '',
        submitted: false,
        joined: false
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGameCodeChange = this.handleGameCodeChange.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'GAME_JOINED':
                this.context.setContext({gameCode: event.gameCode, game: event.game, playerName: event.playerName, player: event.player});
                this.setState({joined: true});
                return true;
        }
        return false;
    }

    handleSubmit() {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: "PLAYER_JOIN",
            gameCode: this.state.gameCode,
            playerName: this.state.playerName
        });
    }

    handleGameCodeChange(event) {
        this.setState({gameCode: event.target.value});
    }

    handlePlayerNameChange(event) {
        this.setState({playerName: event.target.value});
    }

    render() {
        if(this.state.joined) {
            return (
                <Container>
                    <p>
                        Player name : {this.context.playerName}
                    </p>
                    <p>
                        Waiting for game start...
                    </p>
                </Container>
            );
        }
        return (
            <Container>
                <Button onClick={() => Router.back()}>←</Button>
                <Form inverted onSubmit={this.handleSubmit} loading={this.state.submitted}>
                    <Form.Field>
                        <label>Game code</label>
                        <input type="number" placeholder='Game code' onChange={this.handleGameCodeChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>playerName</label>
                        <input placeholder='playerName' onChange={this.handlePlayerNameChange} />
                    </Form.Field>
                    <Button type='submit' primary>Join</Button>
                </Form>
            </Container>
        );
    }
};