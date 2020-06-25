import React, { Component, useContext } from 'react'
import UserContext from './components/UserContext';
import { Checkbox, Container, Form, Button } from 'semantic-ui-react'

export default class Join extends Component {
    static contextType = UserContext;

    state = {
        gameCode: '',
        playerName: '',
        submitted: false,
        joined: false,
        mode: 'PLAYER',
        rejoin: false,
        customPlayerId: ''
    };

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleGameCodeChange = this.handleGameCodeChange.bind(this);
        this.handlePlayerNameChange = this.handlePlayerNameChange.bind(this);
        this.handlePlayerIDChange = this.handlePlayerIDChange.bind(this);
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
            case 'GAME_PUSH':
                this.context.setContext({gameCode: event.gameCode, game: event.game});
                this.setState({joined: true});
                Router.push('/win');
                return true;
        }
        return false;
    }

    sendPlayerJoin() {
        if(this.state.rejoin) {
            this.context.setContext({playerName: this.state.playerName});
            this.context.sendEvent({
                type: "GAME_GET",
                gameCode: this.state.gameCode
            });
        } else {
            this.context.sendEvent({
                type: "PLAYER_JOIN",
                gameCode: this.state.gameCode,
                playerName: this.state.playerName
            });
        }
    }

    handleSubmit() {
        let obj = this;
        this.setState({ submitted: true });
        if(this.state.mode === 'PLAYER') {
            this.sendPlayerJoin();
        } else if(this.state.mode === 'CUSTOMPLAYER') {
            this.context.setContext({playerId: this.state.customPlayerId}, () => {
                obj.sendPlayerJoin();
            });
        } else if(this.state.mode === 'GAMEMASTER') {
            this.context.setContext({gameMaster: true}, () => {
                this.context.sendEvent({
                    type: "GAME_GET",
                    gameCode: this.state.gameCode
                });
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

    handlePlayerIDChange(event) {
        this.setState({customPlayerId: event.target.value});
    }

    handleMode = (e, { value }) => this.setState({ mode: value })

    toggleRejoin = () => this.setState((prevState) => ({ rejoin: !prevState.rejoin }))

    render() {
        if(this.state.joined) {
            return (
                <Container>
                    {this.context.playerName !== null ? (
                        <p>
                            Player name : {this.context.playerName}
                        </p>
                    ): ''}
                    <p>
                        Waiting for game start...
                    </p>
                </Container>
            );
        }
        let advanced = ((new URLSearchParams(window.location.search)).get("adv") !== undefined);
        return (
            <Container>
                <Button onClick={() => this.context.history.goBack()}>←</Button>
                <Form inverted onSubmit={this.handleSubmit} loading={this.state.submitted}>
                    <Form.Field>
                        <label>Game code</label>
                        <input type="number" placeholder='Game code' onChange={this.handleGameCodeChange} />
                    </Form.Field>
                    {this.state.mode === 'PLAYER' || this.state.mode === 'CUSTOMPLAYER' ?
                        <Form.Field>
                            <label>Player name</label>
                            <input placeholder='Player name' onChange={this.handlePlayerNameChange} />
                        </Form.Field> : ''
                    }
                    {this.state.mode === 'CUSTOMPLAYER' ?
                        <Form.Field>
                            <label>Player ID</label>
                            <input placeholder='Player ID' onChange={this.handlePlayerIDChange} />
                        </Form.Field> : ''
                    }
                    {advanced ? (
                        <Form.Group inline>
                            <label>Mode</label>
                            <Form.Radio
                            label='Local player ID'
                            value='PLAYER'
                            checked={this.state.mode === 'PLAYER'}
                            onChange={this.handleMode}
                            />
                            <Form.Radio
                            label='Custom player ID'
                            value='CUSTOMPLAYER'
                            checked={this.state.mode === 'CUSTOMPLAYER'}
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
                    ): ''}
                    {advanced && ( this.state.mode === 'PLAYER' || this.state.mode === 'CUSTOMPLAYER' ) ? (
                        <Form.Group>
                            <Checkbox
                            label='Rejoin'
                            onChange={this.toggleRejoin}
                            checked={this.state.rejoin}
                            />
                        </Form.Group>
                    ) : ''}
                    <Button type='submit' primary>Join</Button>
                </Form>
            </Container>
        );
    }
};
