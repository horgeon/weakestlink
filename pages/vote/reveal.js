import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Table, Container, Form, Button, Checkbox } from 'semantic-ui-react'

export default class Reveal extends Component {
    static contextType = UserContext;

    state = {
        excludedPlayers: [],
        players: [],
        submitted: false,
        done: false
    };

    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this.handleStop = this.handleStop.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let currentSeq = this.getCurrentSequence();
        this.setState({numberToExclude: currentSeq.numberToExclude, players: [...currentSeq.players], excludedPlayers: [...currentSeq.excludedPlayers]});
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    handleStop() {
        this.context.sendEvent({
            type: 'VOTE_STOP',
            gameCode: this.context.gameCode
        });
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'VOTE_STOPPED':
                this.setState({done: true});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

    render() {
        let currentSeq = this.getCurrentSequence();
        if(currentSeq.type === 'VOTE') {
            let btn = [];
            if(this.context.gameMaster || this.context.gameAssistant) {
                btn.push((
                    <Form inverted onSubmit={this.handleStop} loading={this.state.submitted}>
                        <Button type='submit' primary>Continue</Button>
                    </Form>
                ));
            }
            let excludedPlayersElems = [];
            this.state.excludedPlayers.forEach(player => {
                excludedPlayersElems.push((
                    <li>{player.name} {player.currentStatus}</li>
                ));
            });
            return (
                <Container>
                    <p>Excluded players :</p>
                    <ul>
                        {excludedPlayersElems}
                    </ul>
                    {btn}
                </Container>
            );
        }
        return (
            <Container>Waiting...</Container>
        );
    }
};