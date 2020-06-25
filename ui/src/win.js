import React, { Component, useContext } from 'react'
import UserContext from './components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

export default class Win extends Component {
    static contextType = UserContext;

    state = {
        players: [],
        winner: null
    }

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let winner = this.context.game.players.find(player => player.isWinner === true);
        this.setState({players: [...this.context.game.players], winner: winner});
    }

    onEvent(event) {
        switch(event.type) {
            case 'ROUND_STOP':
                return true;
        }
        return false;
    }

    render() {
        return (
            <Container>
                <p>The winner is :</p>
                <p><b>{this.state.winner !== null ? this.state.winner.name : ''}</b></p>
            </Container>
        );
    }
};