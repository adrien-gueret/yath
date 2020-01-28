(function(window, document, undefined) {
    function Game(gameContainer, onClickCallbacks) {
        var that = this;

        that.gameContainer = gameContainer || document.body;
        that.screens = {};
      
        var domScreens = that.gameContainer.querySelectorAll('[data-yath-screen]');

        for (var screenIndex = 0, totalScreens = domScreens.length; screenIndex < totalScreens; screenIndex++) {
            var screen = domScreens[screenIndex];
            var screenName = screen.getAttribute('data-yath-screen');

            screen.classList.add('yathScreen');
            
            that.screens[screenName] = screen;

            screen.removeAttribute('data-yath-screen');
        }

        var onClickHandlers = Object.keys(onClickCallbacks || {}).reduce(function(allCallbacks, callbackName) {
            allCallbacks[callbackName] = onClickCallbacks[callbackName].bind(that);
            return allCallbacks;
        }, {});

        function getClickHandler(callbackName) {
            return function(e) {
                var onClickCallback = onClickHandlers[callbackName];
    
                if (!onClickCallback) {
                    return true;
                }
    
                if (onClickCallback(that, e) === false) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            };
        }

        var domOnclicks = that.gameContainer.querySelectorAll('[data-yath-onclick]');

        for (var onClickIndex = 0, totalOnclicks = domOnclicks.length; onClickIndex < totalOnclicks; onClickIndex++) {
            var domElement = domOnclicks[onClickIndex];
            var callbackName = domElement.getAttribute('data-yath-onclick');

            domElement.classList.add('yathClickable');
            domElement.addEventListener('click', getClickHandler(callbackName));

            domElement.removeAttribute('data-yath-onclick');
        }

        function getGoHandler(screenName) {
            return function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
    
                that.goToScreen(screenName);
            };
        }

        var domGoTo = that.gameContainer.querySelectorAll('[data-yath-go-to]');

        for (var goToIndex = 0, totalGoTo = domGoTo.length; goToIndex < totalGoTo; goToIndex++) {
            var goToElement = domGoTo[goToIndex];
            var screenName = goToElement.getAttribute('data-yath-go-to');

            goToElement.classList.add('yathClickable');
            goToElement.addEventListener('click', getGoHandler(screenName));

            goToElement.removeAttribute('data-yath-go-to');
        }
    }

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