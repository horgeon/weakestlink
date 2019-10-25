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
        joined: false,
        mode: 'PLAYER'
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGameCodeChange = this.handleGameCodeChange.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
        this.onEvent = this.onEvent.bind(this);
    }

    static getInitialProps({query}) {
        return {query}
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
            case 'GAME_PUSH':
                this.context.setContext({gameCode: event.gameCode, game: event.game});
                this.setState({joined: true});
                return true;
        }
        return false;
    }

    handleSubmit() {
        this.setState({ submitted: true });
        if(this.state.mode === 'PLAYER') {
            this.context.sendEvent({
                type: "PLAYER_JOIN",
                gameCode: this.state.gameCode,
                playerName: this.state.playerName
            });
        } else if(this.state.mode === 'GAMEMASTER') {
            this.context.setContext({gameMaster: true});
            this.context.sendEvent({
                type: "GAME_GET",
                gameCode: this.state.gameCode
            });
        } else {
            this.context.sendEvent({
                type: "GAME_GET",
                gameCode: this.state.gameCode
            });
        }
    }

    handleGameCodeChange(event) {
        this.setState({gameCode: event.target.value});
    }

    handlePlayerNameChange(event) {
        this.setState({playerName: event.target.value});
    }

    handleMode = (e, { value }) => this.setState({ mode: value })

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
        let advanced = [];
        if(this.props.query.adv !== undefined) {
            advanced.push((
                <Form.Group inline>
                    <label>Mode</label>
                    <Form.Radio
                    label='Player'
                    value='PLAYER'
                    checked={this.state.mode === 'PLAYER'}
                    onChange={this.handleMode}
                    />
                    <Form.Radio
                    label='Spectator'
                    value='SPECTATOR'
                    checked={this.state.mode === 'SPECTATOR'}
                    onChange={this.handleMode}
                    />
                    <Form.Radio
                    label='Game master'
                    value='GAMEMASTER'
                    checked={this.state.mode === 'GAMEMASTER'}
                    onChange={this.handleMode}
                    />
                </Form.Group>
            ));
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
                        <label>Player name</label>
                        <input placeholder='Player name' onChange={this.handlePlayerNameChange} />
                    </Form.Field>
                    {advanced}
                    <Button type='submit' primary>Join</Button>
                </Form>
            </Container>
        );
    }
};