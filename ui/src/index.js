import io from 'socket.io-client';

import Cookies from 'js-cookie'

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Router,
  Switch,
  Route
} from 'react-router-dom';
import { createHashHistory } from 'history';

import Index from './main';
import Join from './join';
import New from './new';
import Start from './start';
import Win from './win';
import Faceoff from './faceoff';
import Round from './round';
import Vote from './vote';

import UserContext from './components/UserContext';
import { Segment, Dimmer, Loader, Message } from 'semantic-ui-react'

class GameApp extends Component {
    state = {
        playerId: null,
        game: null,
        onEventCallback: null,
        io: null,
        errors: [],
        connected: true,
        loading: false,
        gameMaster: false,
        gameAssistant: false,
        eventsOnWait: [],
        player: null,
        playerName: null,
        inverted: true,
        history: createHashHistory()
    };

    constructor(props) {
        super(props);
        this.state.io = io();
        this.setOnEvent = this.setOnEvent.bind(this);
        this.sendEvent = this.sendEvent.bind(this);
        this.handleDismissError = this.handleDismissError.bind(this);
        this.setContext = this.setContext.bind(this);
        this.state.setOnEvent = this.setOnEvent;
        this.state.sendEvent = this.sendEvent;
        this.state.setContext = this.setContext;
    }

    componentDidMount = () => {
        let obj = this;
        /*Router.events.on('routeChangeStart', url => this.setState({loading: true}));
        Router.events.on('routeChangeComplete', () => this.setState({loading: false}));
        Router.events.on('routeChangeError', () => this.setState({loading: false}));*/
        obj.setState({playerId: Cookies.get('gamesession')});
        obj.state.io.on('connect', () => {
            console.log('# Socket connected.');
            obj.setState({connected: false});
            obj.state.io.on('disconnect', function () {
                obj.setState({connected: true});
            });
            obj.state.io.on('downevent', (event) => {
                console.log('<= Down event :');
                console.log(event);
                if(event == null) {
                    console.error('Invalid event.');
                    obj.errorAdd('Invalid event received.');
                    return;
                }
                switch(event.type) {
                    case "ERROR":
                        obj.errorAdd(event.msg);
                        obj.state.onEventCallback(event);
                        break;
                    case "SET_UI":
                        obj.setState({game: event.game});
                        obj.state.history.push(event.path);
                        obj.state.history.goForward();
                        break;
                    default:
                        if(obj.state.onEventCallback != null) {
                            if(!obj.state.onEventCallback(event)) {
                                obj.setState((state) => {
                                    return {eventsOnWait: [...state.eventsOnWait, event]}
                                });
                            }
                        }
                        break;
                }
            });
        });
    };

    setOnEvent(onEventCallback) {
        this.setState({
            onEventCallback: onEventCallback
        }, () => {
            this.state.eventsOnWait.forEach((event, index, array) => {
                console.log('> Processing waiting event :');
                console.log(event);
                if(this.state.onEventCallback(event)) {
                    array.splice(index, 1);
                }
            });
        });
    }

    setContext(context, callback) {
        return this.setState(context, callback);
    }

    sendEvent(event) {
        let playerId = this.state.playerId;
        let obj = this;
        this.state.io.emit('upevent', Object.assign(event, {
            playerId: playerId
        }));
        console.log('>= Up event :');
        console.log(event);
    }

    handleDismissError(errorIndex) {
        let errors = [...this.state.errors];
        errors.splice(errorIndex, 1);
        this.setState({errors: errors});
    }

    errorAdd(msg) {
        let newErrorIndex = this.state.errors.length;
        let newError = (
            <Message onDismiss={this.handleDismissError(newErrorIndex)} floating>
                {msg}
            </Message>
        );
        this.setState({errors: [...this.state.errors, newError]});
    }

    render() {
        return (
            <UserContext.Provider value={this.state}>
                <Router history={this.state.history}>
	                <style jsx global>{`
	                    html, body, #__next {
	                        width: 100%;
	                        height: 100%;
	                        margin: 0;
	                    }
	                `}</style>
                    <Segment inverted={this.state.inverted}>
                        <Dimmer style={{ width: '100%', height: '100%' }} active={this.state.connected}>
                            <Loader>Connecting...</Loader>
                        </Dimmer>
                        <Dimmer style={{ width: '100%', height: '100%' }} active={this.state.loading}>
                            <Loader />
                        </Dimmer>
                        <div>
                            {this.state.errors}
                        </div>
                        <Switch>
                            <Route exact path="/">
                                <Index style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/join">
                                <Join style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/new">
                                <New style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/start">
                                <Start style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/win">
                                <Win style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/faceoff">
                                <Faceoff style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/round">
                                <Round style={{ width: '100%', height: '100%' }} />
                            </Route>
                            <Route path="/vote">
                                <Vote style={{ width: '100%', height: '100%' }} />
                            </Route>
                        </Switch>
                    </Segment>
                </Router>
            </UserContext.Provider>
        );
    }
}

ReactDOM.render(
  <GameApp />,
  document.getElementById('root')
);
