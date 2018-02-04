(function(window, undefined) {
    if (!window.yath) {
        throw new ReferenceError('yath is not defined: did you include yath.js file?');
    }

    var texts = {
        welcome: {
            header: {
                fr: 'Bienvenue dresseur !',
                en: 'Welcome, trainer!'
            },
            description: {
                fr: 'Ceci sera un <a href="#" data-yath-go-to="tuto1">chouette</a> jeu.',
                en: 'This will be a <a href="#" data-yath-go-to="tuto1">very cool</a> game.'
            },
            continue: {
                fr: 'Continuer',
                en: 'Continue'
            }
        }
    };

    var callbacks = {
      test: function(target) {
          console.log(this, target);
      }
    };

    var myGame = new window.yath.Game(texts, callbacks);
    myGame.language = 'fr';
    myGame.goToScreen('welcome');

    window.myGame =  myGame;

})(window);