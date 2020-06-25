import { Component } from 'react'

export default class Duration extends Component {
    render() {
        const { value } = this.props;
        let m = Math.floor(value / (60 * 1000));
        let s = Math.floor((value % (60 * 1000)) / 1000);
        return (
            <span>{m}:{s}</span>
        );
    }
};

