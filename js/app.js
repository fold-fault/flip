'use strict';

var app = angular.module('flip', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/index.html',
        controller: 'IndexController'
    }).when('/levels', {
        templateUrl: 'partials/levels/list.html',
        controller: 'LevelsController'
    }).when('/levels/create', {
        templateUrl: 'partials/levels/create.html',
        controller: 'LevelsCreateController'
    });
});

app.directive('flClickdrag', function () {
    var mouseIsDown = false;
    angular.element(document).bind('mouseup', function () {
        mouseIsDown = false;
    });
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var mouseHasLeft = 'false';
            element.bind('mousedown', function () {
                callAttrib();
                mouseIsDown = true;
            });
            element.bind('mouseenter', function () {
                if (mouseIsDown) {
                    callAttrib();
                }
            });
            element.bind('mouseexit', function () {
                mouseIsDown = false;
            });
            function callAttrib() {
                scope.$apply(attrs.flClickdrag);
            }
        }
    };
});

app.directive('board', function () {
    return {
        retrict: 'A',
        templateUrl: 'partials/directives/board.html',
        link: function (scope, element, attrs) {
            console.log('I was called');
        }
    }
});

app.service('Boards', function ($q, $http) {
    var abstracts = [{
        'blueprint': [
            [1, 0],
            [0, 0],
        ],
        'goal': 2,
        'difficulty': 0
    }, {
        'blueprint': [
            [1, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        'goal': 4,
        'difficulty': 1
    }, {
        'blueprint': [
            [0, -1, 0, 0],
            [0, 0, 1, 0],
            [-1, 0, 0, -1],
            [0, 0, 0, 0],
        ],
        'goal': 4,
        'difficulty': 1
    }, {
        'blueprint': [
            [1, 0, 0, 0],
            [0, 0, 0, 0],
            [-1, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        'goal': 4,
        'difficulty': 1
    }, {
        'blueprint': [
            [1, 0, 0, 0],
            [0, 0, -1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        'goal': 4,
        'difficulty': 1
    }, {
        'blueprint': [
            [0, 0, 0, 0, 0, 0],
            [0, -1, 0, 0, -1, -1],
            [0, -1, 0, 0, 0, 0],
            [0, 0, 1, 0, -1, 0],
            [0, -1, 0, 0, -1, 0],
            [0, 0, 0, 0, 0, 0],
        ],
        'goal': 6,
        'difficulty': 2
    }, {
        'blueprint': [
            [1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
        'goal': 6,
        'difficulty': 2
    }, {
        'blueprint': [
            [-1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, -1, 0],
            [0, 0, -1, -1, 0, -1],
            [0, 0, 0, -1, 0, 0],
            [0, 0, 0, 1, -1, 0],
            [0, 0, 0, 0, 0, 0]
        ],
        'goal': 6,
        'difficulty': 3
    }];
    var typeToInt = {
        'beginner':  0,
        'easy':  1,
        'medium':  2,
        'hard':  3,
    };
    function Boards() {}
    Boards.prototype.getA = function (type) {
        var deferred = $q.defer();
        var intDifficultyLevel = typeToInt[type];
        var typedBoards = abstracts.filter(function (abs) {
            return abs.difficulty > intDifficultyLevel;
        });
        var item = typedBoards[parseInt(Math.random()*typedBoards.length)];
        deferred.resolve(new Board(item));
        return deferred.promise;
    }
    Boards.prototype.getLoadingBoard = function () {
        return new Board({
            'blueprint': [
                [0, 0],
                [0, 0]
            ],
            'goal': '?'
        });
    }
    Boards.prototype.getAll = function () {
        var boards = abstracts.map(function (abs) {
            return new Board(abs);
        });
        var deferred = $q.defer();
        deferred.resolve(boards);
        return deferred.promise;
    }
    return new Boards();
});

app.controller('HeaderController', function ($scope) {
    $scope.navigation = {
        'open': false,
        'pages': [{
            'url': '/',
            'title': 'Game'
        }, {
            'url': '/levels',
            'title': 'Levels'
        }, {
            'url': '/levels/create',
            'title': 'Create Levels'
        }, {
            'url': '/about',
            'title': 'About'
        }]
    };
});

app.controller('IndexController', function ($scope, Boards) {
    $scope.globalState = {
        'touchDownTileIsSelected': false
    };

    setBoard(Boards.getLoadingBoard());

    Boards.getA('medium').then(function (board) {
        setBoard(board);
    });

    angular.element(document).bind('keydown', function (event) {
        $scope.$apply(function () {
            $scope.board.onKeyEvent(event);
        });
    });

    function setBoard(board) {
        $scope.boardIsLoading = false;
        $scope.board = board;
    }
});

app.controller('LevelsCreateController', function ($scope) {
});

app.controller('LevelsController', function ($scope, Boards) {
    $scope.levels = [];

    $scope.difficultyNames = {
        0: 'Beginner',
        1: 'Easy',
        2: 'Medium',
        3: 'Difficult'
    };

    var boards = Boards.getAll().then(function (boards) {
        var levels = [];
        for (var i = 0 ; i < boards.length ; i++) {
            var board = boards[i];
            if (!levels.hasOwnProperty(board.difficulty)) {
                levels[board.difficulty] = [];
            }
            levels[board.difficulty].push(board);
        }

        $scope.levels = levels;
    });

    $scope.play = function () {
        ;
    };
});

/*
// for testing the board without having to click through the ui
var a = new Board(tileAbstractions.easy);
a.select(0, 0);
console.log(a.toString());
a.flip('down');
console.log(a.toString());
a.select(0,0);
a.select(0,1);
console.log(a.toString());
a.flip('right');
console.log(a.toString());
a.select(0,1);
a.select(1,0);
a.select(1,1);
console.log(a.toString());
a.flip('right');
console.log(a.toString());
a.flip('down');
console.log(a.toString());
a.undo();
console.log(a.toString());
a.select(0,0);
a.select(1,0);
console.log(a.toString());
a.flip('right');
console.log(a.toString());
*/
