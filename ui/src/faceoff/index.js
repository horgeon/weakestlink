import React, { Component, useContext } from 'react'
import { Switch, Route } from "react-router-dom";

import UserContext from './../components/UserContext';
import Run from './run';
import Start from './start';

export default class FaceoffIndex extends Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Switch>
                <Route path={"/faceoff/run"}>
                    <Run />
                </Route>
                <Route path={"/faceoff/start"}>
                    <Start />
                </Route>
            </Switch>
        );
    }
};