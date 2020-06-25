import React, { Component, useContext } from 'react'
import { Switch, Route } from "react-router-dom";

import UserContext from './../components/UserContext';
import Run from './run';
import Start from './start';

export default class RoundIndex extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path={"/round/run"}>
                    <Run />
                </Route>
                <Route path={"/round/start"}>
                    <Start />
                </Route>
            </Switch>
        );
    }
};