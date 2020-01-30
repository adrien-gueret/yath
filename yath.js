function yath(container, options) {
    var gameContainer = container || document.body;
    var onClickCallbacks = options.onClickCallbacks || {};
    var onScreenChange = options.onScreenChange || function() {};

    var screens = {};
    var visitedScreensTracker = {};

    function goToScreen(screenName) {
        var targetScreen = screens[screenName];

        if (!targetScreen) {
            throw new ReferenceError('yath: try to go to screen "' + screenName + '", which is not found.');
        }

        var callbackData = {
            game: game,
            screenName: screenName,
            screen: targetScreen,
        };

        if (onScreenChange(callbackData) === false) {
            return;
        }

        for (var screenName in screens) {
            var screen = screens[screenName];

            if (screen !== targetScreen && screen.classList.contains('yathScreen--visible')) {
                screen.classList.remove('yathScreen--visible');
            }
        }

        visitedScreensTracker[screenName]++;

        targetScreen.classList.add('yathScreen--visible');
    }

    function getScreenVisits(screenName) {
        return visitedScreensTracker[screenName];
    }

    function hasVisitedScreen(screenName) {
        return getScreenVisits(screenName) > 0;
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
        },
        goToScreen: goToScreen,
        getScreenVisits: getScreenVisits,
        hasVisitedScreen: hasVisitedScreen,
    };
    
    // Init DOM screens
    var domScreens = gameContainer.querySelectorAll('[data-yath-screen]');

    for (var screenIndex = 0, totalScreens = domScreens.length; screenIndex < totalScreens; screenIndex++) {
        var screen = domScreens[screenIndex];
        var screenName = screen.getAttribute('data-yath-screen');

        screen.classList.add('yathScreen');
        
        screens[screenName] = screen;
        visitedScreensTracker[screenName] = 0;

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

    return game;
}
