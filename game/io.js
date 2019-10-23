global.gameIO = {
    io: undefined,
    onEventCallback: undefined,
    onEvent: function(from, event) {
        gameIO.onEventCallback(from, event);
    },
    sendEvent: function(destination, event) {
        if(event === undefined) {
            console.log('>= Down broadcast event :');
            console.log(destination);
            gameIO.io.emit('downevent', destination);
        } else {
            console.log('>= Down event :');
            console.log(event);
            destination.emit('downevent', event);
        }
    }
};