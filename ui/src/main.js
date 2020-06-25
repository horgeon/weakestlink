import React, { Component } from 'react'
import { Segment, Container, Button } from 'semantic-ui-react'

import { Link } from 'react-router-dom';

export default class Index extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Segment inverted>
                <Container>
                    <Link to="/new">
                        <Button>Create a game</Button>
                    </Link>
                    <Link to="/join">
                        <Button>Join a game</Button>
                    </Link>
                </Container>
            </Segment>
        );
    }
}