import { Component } from 'react'

export default class Duration extends Component {
    render() {
        const { value } = this.props;
        let s = Math.floor(value / 1000);
        let ms = value - s * 1000;
        return (
            <span>{s}.{ms}</span>
        );
    }
};