import React from 'react';
import App from 'next/app';
import Head from 'next/head'
import UserContext from '../components/UserContext';

import io from 'socket.io-client';
import Router from 'next/router';

import Cookies from 'js-cookie'

import { Segment, Dimmer, Loader, Message } from 'semantic-ui-react'
//import 'semantic-ui-css/semantic.min.css'

export default class GameApp extends App {
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
        inverted: true
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
        Router.events.on('routeChangeStart', url => this.setState({loading: true}));
        Router.events.on('routeChangeComplete', () => this.setState({loading: false}));
        Router.events.on('routeChangeError', () => this.setState({loading: false}));
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
                        Router.push(event.path);
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
        const { Component, pageProps } = this.props;

        return (
            <UserContext.Provider value={this.state}>
                <Head>
                    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
                    <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
<<<<<<< HEAD
                </Head>
                <Segment inverted={this.state.inverted}>
                    <Dimmer active={this.state.connected}>
                        <Loader>Connecting...</Loader>
                    </Dimmer>
                    <Dimmer active={this.state.loading}>
                        <Loader />
=======

                </Head>
                <style jsx global>{`
                    html, body, #__next {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                    }
                `}</style>
                <Segment inverted={this.state.inverted} style={{ width: '100%', height: '100%', borderRadius: '0' }}>
                    <Dimmer active={this.state.connected} style={{ width: '100%', height: '100%' }}>
                        <Loader style={{ width: '100%', height: '100%' }}>Connecting...</Loader>
                    </Dimmer>
                    <Dimmer active={this.state.loading} style={{ width: '100%', height: '100%' }}>
                        <Loader style={{ width: '100%', height: '100%' }} />
>>>>>>> 26102019-prod
                    </Dimmer>
                    <div>
                        {this.state.errors}
                    </div>
<<<<<<< HEAD
                    <Component {...pageProps} />
=======
                    <Component style={{ width: '100%', height: '100%' }} {...pageProps} />
>>>>>>> 26102019-prod
                </Segment>
            </UserContext.Provider>
        );
    }
}
