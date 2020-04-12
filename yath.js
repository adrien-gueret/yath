function yath(container, options) {
    var gameContainer = container || document.body;
    gameContainer.style.setProperty('display', 'none');

    var ensuredOptions = options || {};
    var onClickCallbacks = ensuredOptions.onClickCallbacks || {};
    var onScreenChange = ensuredOptions.onScreenChange || function() {};

    var screens = {};
    var history = {};

    function forEachScreens(callback) {
        for (var screenName in screens) {
            callback(screens[screenName]);
        };
    }

    function removeFromDom(element) {
        element.parentNode.removeChild(element);
    }

    function goToScreen(targetScreenName) {
        var targetScreen = screens[targetScreenName];

        if (!targetScreen) {
            throw new ReferenceError('yath: try to go to screen "' + targetScreenName + '", which is not found.');
        }

        var callbackData = {
            game: game,
            screenName: targetScreenName,
            screen: targetScreen,
        };

        if (onScreenChange(callbackData) === false) {
            return;
        }

        forEachScreens(function(screen) {
            if (screen !== targetScreen && screen.classList.contains('yathScreen--visible')) {
                screen.addEventListener('transitionend', function() {
                    removeFromDom(screen);
                }, {
                    capture: false,
                    once: true,
                    passive: true,
                });
                screen.classList.remove('yathScreen--visible');
            }
        });

        history[targetScreenName]++;

        gameContainer.appendChild(targetScreen);
        targetScreen.classList.add('yathScreen--visible');
    }

    function getScreenVisits(screenName) {
        return history[screenName];
    }

    function hasVisitedScreen(screenName) {
        return getScreenVisits(screenName) > 0;
    }

    function resetHistory() {
        Object.keys(history).forEach(function(screenName) {
            history[screenName] = 0;
        });
    }

    var inventoryItems = {};

    function countItem(itemName) {
        return inventoryItems[itemName] || 0;
    }

    function hasItem(itemName) {
        return countItem(itemName) > 0;
    }

    function addItem(itemName, total) {
        if (!hasItem(itemName)) {
            inventoryItems[itemName] = 0;
        }

        inventoryItems[itemName] += (total || 1);

        return inventoryItems[itemName];
    }

    function removeItem(itemName, total) {
        if (!hasItem(itemName)) {
            inventoryItems[itemName] = 0;
        }

        inventoryItems[itemName] = Math.max(inventoryItems[itemName] - (total || 1), 0);

        return inventoryItems[itemName];
    }

    function resetInventory() {
        inventoryItems = {};
    }

    function getAllItems() {
        return Object.keys(inventoryItems).map(function(itemName) {
            return { itemName: itemName, total: inventoryItems[itemName] };
        });
    }

    // Exposed object
    var game = {
        inventory: {
            countItem: countItem,
            hasItem: hasItem,
            addItem: addItem,
            removeItem: removeItem,
            getAllItems: getAllItems,
            reset: resetInventory,
        },
        goToScreen: goToScreen,
        getScreenVisits: getScreenVisits,
        hasVisitedScreen: hasVisitedScreen,
        resetHistory: resetHistory,
    };
    
    // Init DOM screens
    var domScreens = gameContainer.querySelectorAll('[data-yath-screen]');

    for (var screenIndex = 0, totalScreens = domScreens.length; screenIndex < totalScreens; screenIndex++) {
        var screen = domScreens[screenIndex];
        var screenName = screen.getAttribute('data-yath-screen');

        screen.classList.add('yathScreen');
        
        screens[screenName] = screen;
        history[screenName] = 0;

        screen.removeAttribute('data-yath-screen');
    }

    // Listen for custom click handlers
    var onClickHandlers = Object.keys(onClickCallbacks).reduce(function(allCallbacks, callbackName) {
        allCallbacks[callbackName] = onClickCallbacks[callbackName];
        return allCallbacks;
    }, {});

    function getClickHandler(callbackName) {
        return function(e) {
            var onClickCallback = onClickHandlers[callbackName];

            if (!onClickCallback) {
                return true;
            }

            if (onClickCallback(game, e) === false) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        };
    }

    var domOnclicks = gameContainer.querySelectorAll('[data-yath-onclick]');

    for (var onClickIndex = 0, totalOnclicks = domOnclicks.length; onClickIndex < totalOnclicks; onClickIndex++) {
        var domElement = domOnclicks[onClickIndex];
        var callbackName = domElement.getAttribute('data-yath-onclick');

        domElement.classList.add('yathClickable');
        domElement.addEventListener('click', getClickHandler(callbackName));

        domElement.removeAttribute('data-yath-onclick');
    }

    // Listen for "go to screen" handlers
    function getGoHandler(screenName) {
        return function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            goToScreen(screenName);
        };
    }

    var domGoTo = gameContainer.querySelectorAll('[data-yath-go-to]');

    for (var goToIndex = 0, totalGoTo = domGoTo.length; goToIndex < totalGoTo; goToIndex++) {
        var goToElement = domGoTo[goToIndex];
        var screenName = goToElement.getAttribute('data-yath-go-to');

        goToElement.classList.add('yathClickable');
        goToElement.addEventListener('click', getGoHandler(screenName));

        goToElement.removeAttribute('data-yath-go-to');
    }

    forEachScreens(removeFromDom);

    gameContainer.style.removeProperty('display');

    return game;
}
