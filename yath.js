(function(window, document, undefined) {
    function Game(gameContainer, callbacks) {
        var that = this;

        this.gameContainer = gameContainer || document.body;
        this.screens = {};
        this.callbacks = Object.keys(callbacks || {}).reduce(function(finalCallbacks, callbackName) {
            finalCallbacks[callbackName] = callbacks[callbackName].bind(that);
            return finalCallbacks;
        }, {});
        this.data = {};

        var domScreens = this.gameContainer.querySelectorAll('[data-yath-screen]');

        for (var screenIndex = 0, totalScreens = domScreens.length; screenIndex < totalScreens; screenIndex++) {
            var screen = domScreens[screenIndex];
            var screenName = screen.getAttribute('data-yath-screen');

            screen.classList.add('yathScreen');
            screen.classList.add(screenName);

            this.screens[screenName] = screen;

            screen.removeAttribute('data-yath-screen');
        }

        this.attachEvents(this.gameContainer);
    }

    Game.prototype.attachEvents = function(container) {
        var domOnclicks = container.querySelectorAll('[data-yath-onclick]');

        for (var onClickIndex = 0, totalOnclicks = domOnclicks.length; onClickIndex < totalOnclicks; onClickIndex++) {
            var domElement = domOnclicks[onClickIndex];
            var callbackName = domElement.getAttribute('data-yath-onclick');

            domElement.classList.add('yathClickable');
            domElement.addEventListener('click', this.getClickHandler(callbackName));

            domElement.removeAttribute('data-yath-onclick');
        }

        var domGoTo = container.querySelectorAll('[data-yath-go-to]');

        for (var goToIndex = 0, totalGoTo = domGoTo.length; goToIndex < totalGoTo; goToIndex++) {
            var goToElement = domGoTo[goToIndex];
            var screenName = goToElement.getAttribute('data-yath-go-to');

            goToElement.classList.add('yathClickable');
            goToElement.addEventListener('click', this.getGoHandler(screenName));

            goToElement.removeAttribute('data-yath-go-to');
        }
    };

    Game.prototype.getClickHandler = function(callbackName) {
        var that = this;

        return function(e) {
            var callback = that.callbacks[callbackName];

            if (!callback) {
                return true;
            }

            if (callback(e.target) === false) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };
    };

    Game.prototype.getGoHandler = function(screenName) {
        var that = this;

        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            that.goToScreen(screenName);
        };
    };

    Game.prototype.goToScreen = function(screenName) {
        var targetScreen = this.screens[screenName];

        if (!targetScreen) {
            throw new ReferenceError('yath: try to go to screen "' + screenName + '", which is not found.');
        }

        for (var screenName in this.screens) {
            var screen = this.screens[screenName];

            if (screen !== targetScreen && screen.classList.contains('yathScreen--visible')) {
                screen.classList.remove('yathScreen--visible');
            }
        }

        targetScreen.classList.add('yathScreen--visible');
    };

    var yath = {
        Game: Game
    };

    window.yath = yath;
})(window, document);