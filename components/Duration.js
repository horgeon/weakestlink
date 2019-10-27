import { Component } from 'react'

export default class Duration extends Component {
    render() {
        const { value } = this.props;
<<<<<<< HEAD
        let s = Math.floor(value / 1000);
        let ms = value - s * 1000;
        return (
            <span>{s}.{ms}</span>
        );
    }
};
=======
        let m = Math.floor(value / (60 * 1000));
        let s = Math.floor((value % (60 * 1000)) / 1000);
        return (
            <span>{m}:{s}</span>
        );
    }
};
>>>>>>> 26102019-prod
