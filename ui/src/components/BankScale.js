import React, { Component } from 'react'
import { Button } from 'semantic-ui-react'

export default class BankScale extends Component {
    static defaultProps = {
        isVertical: true
    };

    render() {
        const { scale, index, isVertical } = this.props;
        let scaleElements = scale.map((scaleValue, scaleIndex) => isVertical ? (
            <p><Button primary={scaleIndex == index}>{scaleValue}</Button></p>
        ) : (
            <Button primary={scaleIndex == index}>{scaleValue}</Button>
        ));
        return (
            <div>
                {scaleElements}
            </div>
        );
    }
};