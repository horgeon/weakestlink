import React, { Component, useContext } from 'react'
import { Switch, Route } from "react-router-dom";

import UserContext from './../components/UserContext';
import Manual from './manual';
import Reveal from './reveal';
import Vote from './vote';

export default class VoteIndex extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path={"/vote/manual"}>
                    <Manual />
                </Route>
                <Route path={"/vote/reveal"}>
                    <Reveal />
                </Route>
                <Route path={"/vote/vote"}>
                    <Vote />
                </Route>
            </Switch>
        );
    }
};