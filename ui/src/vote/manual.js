import { Component, useContext } from 'react'
import UserContext from './../components/UserContext';
import { Table, Container, Form, Button, Checkbox, Accordion } from 'semantic-ui-react'

export default class Vote extends Component {
    static contextType = UserContext;

    state = {
        players: [],
        submitted: false,
        numberToExclude: -1
    };

    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.handleReveal = this.handleReveal.bind(this);
        this.handleEliminate = this.handleEliminate.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let currentSeq = this.getCurrentSequence();
        let votes = {};
        currentSeq.players.forEach(player => {
            votes[player.id] = 0;
        });
        this.setState({numberToExclude: currentSeq.numberToExclude, players: [...currentSeq.players], votes: votes});
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    handleVote(votedPlayerId, isAddingVote) {
        this.setState({submitted: true});
        this.context.sendEvent({
            type: isAddingVote ? 'VOTE_PLAYER_ADD' : 'VOTE_PLAYER_REMOVE',
            gameCode: this.context.gameCode,
            votedPlayerId: votedPlayerId
        });
    }

    handleEliminate(eliminatedPlayerId) {
        this.setState({submitted: true});
        this.context.sendEvent({
            type: 'VOTE_PLAYER_ELIMINATE',
            gameCode: this.context.gameCode,
            eliminatedPlayerId: eliminatedPlayerId
        });
    }

    handleReveal() {
        this.setState({ submitted: true });
        this.context.sendEvent({
            type: 'VOTE_REVEAL',
            gameCode: this.context.gameCode
        });
    }

    onEvent(event) {
        this.setState({submitted: false});
        switch(event.type) {
            case 'VOTE_PLAYER_MODIFIED':
                this.context.setContext({game: event.game});
                this.setState({players: [...event.game.currentSequence.players]});
                return true;
            case 'ERROR':
                return true;
        }
        return false;
    }

    render() {
        let currentSeq = this.getCurrentSequence();
        if(currentSeq.type === 'VOTE') {
            if(this.context.gameMaster || this.context.gameAssistant) {
                let votes = [];
                let players = [...this.state.players];
                players.sort((a, b) =>  b.currentRoundStats.score - a.currentRoundStats.score);
                players.forEach(player => {
                    let alreadyEliminated = currentSeq.excludedPlayers.find(excludedPlayer => excludedPlayer.id == player.id) !== undefined;
                    votes.push((
                        <Table.Row>
                            <Table.Cell>{player.name}</Table.Cell>
                            <Table.Cell>{player.currentRoundStats.score} {player.currentStatus}</Table.Cell>
                            <Table.Cell>{currentSeq.votes[player.id]}</Table.Cell>
                            <Table.Cell>
                                {alreadyEliminated ? 'Eliminated' : (
                                    <span>
                                        <Button onClick={() => this.handleVote(player.id, true)}>+</Button>
                                        <Button onClick={() => this.handleVote(player.id, false)}>-</Button>
                                        <Button onClick={() => this.handleEliminate(player.id)} color='red'>Eliminate</Button>
                                    </span>
                                )}
                            </Table.Cell>
                        </Table.Row>
                    ));
                });
                let buttons = [];
                buttons.push((
                    <Form inverted onSubmit={this.handleReveal} loading={this.state.submitted}>
                        <Button type='submit' primary>Finish and reveal votes</Button>
                    </Form>
                ));
                return (
                    <Container>
                        <p>Votes for {this.state.numberToExclude} players</p>
                        <Table celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Score</Table.HeaderCell>
                                    <Table.HeaderCell>Votes</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {votes}
                            </Table.Body>
                        </Table>
                        {buttons}
                    </Container>
                );
            } else {
                return (
                    <Container>
                        <p>Vote for {this.state.numberToExclude} players</p>
                    </Container>
                );
            }
        }
        return (
            <Container>Waiting...</Container>
        );
    }
};