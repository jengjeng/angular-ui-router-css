/**
 * Angular UI Router CSS - CSS Resolver for AngularJS UI Router
 * @version v0.0.0
 * @author Wittawat Patcharinsak
 * @link https://github.com/jengjeng/angular-ui-router-css
 */

'use strict';

(function (angular) {
    angular
        .module('ui.router.css', ['ui.router'])
        .directive('head', ['$rootScope', '$compile', '$state', '$interpolate', function ($rootScope, $compile, $state, $interpolate) {
            return {
                restrict: 'E',
                link: function (scope, elem) {
                    var start = $interpolate.startSymbol(),
                        end = $interpolate.endSymbol();
                    var html = '<link rel="stylesheet" ng-repeat="(k, css) in uiRouterCss track by k" ng-href="' + start + 'css' + end + '" >';
                    elem.append($compile(html)(scope));

                    scope.uiRouterCss = [];

                    $rootScope.$on('$stateChangeStart', function (evt, toState) {
                        // From current state to the root
                        var uiRouterCss = {};
                        var states = getParentAndCurrentState($state);
                        states.forEach(function (state, i) {
                            if (!Array.isArray(state.css)) {
                                state.css = [state.css];
                            }
                            angular.forEach(state.css, function (css) {
                                if (!uiRouterCss[state.name]) {
                                    uiRouterCss[state.name] = true;
                                }
                            });
                            scope.uiRouterCss = Object.keys(uiRouterCss);
                        });
                    });
                }
            };
        }
        ]);

    function getParentAndCurrentState($state) {
        var parentStates = [];
        var $currentState = $state.$current;

        while ($currentState && $currentState.self && $currentState.self.name !== '') {
            parentStates.push($currentState.self);
            $currentState = $currentState.parent;
        }

        return parentStates.reverse();
    }
})(angular);