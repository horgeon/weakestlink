import React, { Component } from 'react'
import { Segment, Container, Button } from 'semantic-ui-react'
import Router from 'next/router';

export default class Index extends Component {
    constructor(props) {
        super(props);
        this.handleNewGame = this.handleNewGame.bind(this);
        this.handlePlayerJoin = this.handlePlayerJoin.bind(this);
    }

    handleNewGame() {
        Router.push('/new');
    }

    handlePlayerJoin() {
        Router.push('/join');
    }

    render() {
        return (
            <Segment inverted>
                <Container>
                    <Button onClick={this.handleNewGame}>Create a game</Button>
                    <Button onClick={this.handlePlayerJoin}>Join a game</Button>
                </Container>
            </Segment>
        );
    }
}