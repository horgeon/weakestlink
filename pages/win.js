import { Component, useContext } from 'react'
import UserContext from '../components/UserContext';
import { Segment, Container, Form, Button } from 'semantic-ui-react'

export default class Win extends Component {
    static contextType = UserContext;

    state = {
        players: [],
        winner: null
    }

    constructor(props) {
        super(props);
<<<<<<< HEAD
=======
        this.onEvent = this.onEvent.bind(this);
    }

    onEvent(event) {
        switch(event.type) {
            case 'ERROR':
                return true;
        }
        return false;
>>>>>>> 26102019-prod
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let winner = this.context.game.players.find(player => player.isWinner === true);
        this.setState({players: [...this.context.game.players], winner: winner});
    }

    render() {
        if(this.context.gameMaster || this.context.gameAssistant) {
            return (
                <Container>
                    The winner is :
                    <p><b>{this.state.winner !== null ? this.state.winner.name : ''}</b></p>
<<<<<<< HEAD
=======
                    <p>Bank: {this.context.bank}</p>
>>>>>>> 26102019-prod
                </Container>
            );
        }
        return (
            <Container>
                <p>The winner is :</p>
                <p><b>{this.state.winner !== null ? this.state.winner.name : ''}</b></p>
<<<<<<< HEAD
            </Container>
        );
    }
};
=======
                <p>Bank: {this.context.bank}</p>
            </Container>
        );
    }
};
>>>>>>> 26102019-prod
