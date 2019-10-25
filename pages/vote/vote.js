import { Component, useContext } from 'react'
import UserContext from '../../components/UserContext';
import { Table, Container, Form, Button, Checkbox } from 'semantic-ui-react'

export default class Vote extends Component {
    static contextType = UserContext;

    state = {
        votes: [],
        players: [],
        submitted: false,
        numberToExclude: -1,
        done: false
    };

    constructor(props) {
        super(props);
        this.onEvent = this.onEvent.bind(this);
        this.handleVote = this.handleVote.bind(this);
        this.handleReveal = this.handleReveal.bind(this);
    }

    componentDidMount() {
        this.context.setOnEvent(this.onEvent);
        let currentSeq = this.getCurrentSequence();
        this.setState({numberToExclude: currentSeq.numberToExclude, players: [...currentSeq.players]});
    }

    getCurrentSequence() {
        if(this.context.game !== null && this.context.game.currentSequence !== null)
            return this.context.game.currentSequence;
        return {};
    }

    handleVote(votedPlayerId) {
        this.setState((state) => {
            let votes = [...state.votes];
            votes.push(votedPlayerId);
            return {votes: votes, submitted: true};
        });
        this.context.sendEvent({
            type: 'VOTE_PLAYER',
            gameCode: this.context.gameCode,
            votedPlayerId: votedPlayerId
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
            case 'VOTE_PLAYER_DONE':
                this.context.setContext({game: event.game});
                this.setState({players: [...event.game.currentSequence.players], done: true});
                return true;
            case 'VOTE_PLAYER_REFUSED':
                this.setState((state) => {
                    let i, votes = [...state.votes];
                    if((i = votes.indexOf(event.votedPlayerId)) > -1) {
                        votes.splice(i, 1);
                    }
                    return {votes: votes};
                });
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
                    votes.push((
                        <Table.Row>
                            <Table.Cell>{player.name}</Table.Cell>
                            <Table.Cell>{player.currentRoundStats.score} {player.currentStatus}</Table.Cell>
                            <Table.Cell>{currentSeq.votes[player.id]}</Table.Cell>
                        </Table.Row>
                    ));
                });
                let reveal = [];
                if(this.state.done) {
                    reveal.push((
                        <Form inverted onSubmit={this.handleReveal} loading={this.state.submitted}>
                            <Button type='submit' primary>Reveal votes</Button>
                        </Form>
                    ));
                }
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
                        {reveal}
                    </Container>
                );
            }
            if(this.state.done) {
                let votes = [];
                this.state.players.forEach(player => {
                    let voted = this.state.votes.indexOf(player.id) > -1;
                    if(voted) {
                        votes.push((<li>{player.name}</li>));
                    }
                });
                return (
                    <Container>
                        <p>Vote for {this.state.numberToExclude} players</p>
                        <ul>
                            {votes}
                        </ul>
                    </Container>
                );
            }

            let voteInputs = [];
            this.state.players.forEach(player => {
                let voted = this.state.votes.indexOf(player.id) > -1;
                voteInputs.push((
                    <Checkbox
                        label={player.name}
                        onChange={() => this.handleVote(player.id)}
                        checked={voted}
                        disabled={this.state.votes.length >= this.state.numberToExclude}
                    />
                ));
            });
            return (
                <Container>
                    <p>Vote for {this.state.numberToExclude} players</p>
                    <Form inverted loading={this.state.submitted}>
                        {voteInputs}
                    </Form>
                </Container>
            );
        }
        return (
            <Container>Waiting...</Container>
        );
    }
};