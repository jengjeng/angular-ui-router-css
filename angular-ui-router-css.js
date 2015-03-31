/**
 * Angular UI Router CSS - CSS Resolver for AngularJS UI Router
 * @version v0.0.1
 * @author Wittawat Patcharinsak
 * @link https://github.com/jengjeng/angular-ui-router-css
 */

(function (angular, DEBUG, _moduleName, _appname, _rootName, _sConfigName, _stateSeperator, undefined) {
    angular
        .module(_moduleName, ['ui.router'])
        .provider('$uiRouterCss', ['$stateProvider', function ($stateProvider) {
            var fn = $stateProvider.state;
            var stateDefine = {};
            $stateProvider.state = function uiRouterCssProxyState(name, config) {
                if (name && config) {
                    config.css = config.css === undefined ? [] : config.css;
                    config.css = Array.isArray(config.css) ? config.css : [config.css];
                    setStateResolve(config);
                    setStateDefine(stateDefine, name, config);
                }
                return fn.apply(this, arguments);
            };
            this.$get = [function () {
                return {
                    fromState: null,
                    toState: null,
                    getStateDefine: function (name) {
                        if (name) {
                            return stateDefine[name];
                        }
                        return stateDefine;
                    },
                    css: [],
                    promises: [],
                    deferred: null,
                    removedLinks: []
                };
            }];
        }])
    .directive('head', ['$rootScope', '$compile', '$state', '$interpolate', '$uiRouterCss', '$q', function ($rootScope, $compile, $state, $interpolate, $uiRouterCss, $q) {
        return {
            restrict: 'E',
            link: function (scope, elem) {
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    $uiRouterCss.fromState = fromState;
                    $uiRouterCss.toState = toState;
                    requireCssElement(elem, $uiRouterCss, $q, $uiRouterCss.getStateDefine(toState.name));
                    setStateResolve(toState);
                });
                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    $uiRouterCss.css = $uiRouterCss.getStateDefine(toState.name).css;
                    setCssElement(elem, $uiRouterCss);
                    log('css change to', $uiRouterCss.css);
                });
            }
        };
    }
    ]);

    function requireCssElement($head, $uiRouterCss, $q, toStateDefine) {
        $uiRouterCss.promises = [];
        $uiRouterCss.removedLinks = [];
        $uiRouterCss.deferred = $q.defer();
        $uiRouterCss.deferred.promise.then(function () {
            log('CSS load success');
        })

        var lstCss = toStateDefine.css;
        var oldCssDom = [].slice.apply($head.children('link[ui-router-css]'));
        var oldCss = [];
        // remove old css
        oldCssDom.forEach(function (element) {
            var href = angular.element(element).attr('href');
            if (lstCss.indexOf(href) === -1) {
                $uiRouterCss.removedLinks.push(element);
                log("RemovedCss", href);
            }
            oldCss.push(href);
        });
        // add new css
        var promises = [],
            addedCss = [];
        lstCss.forEach(function (css) {
            if (oldCss.indexOf(css) === -1) {
                var deferred = $q.defer();
                var $link = angular.element('<link rel="stylesheet" href="' + css + '" ui-router-css />');
                setLinkEvent($link[0], function () {
                    log("DOM's load event", $link[0].href);
                    deferred.resolve();
                });
                promises.push(deferred.promise);
                addedCss.push($link);
                $head.append($link);
                log('AddedCss', css);
            }
        });
        $q.all(promises).then(function () {
            $uiRouterCss.deferred.resolve();
        }, function () {
            // rollback removed css
            $uiRouterCss.removedLinks.forEach(function (element) {
                log('rollback removed css', element[0].href);
                $head.append(element);
            });
            // rollback added css
            addedCss.forEach(function (element) {
                log('rollback added css', element[0].href);
                element.remove();
            });
        });
    }

    function setCssElement($head, $uiRouterCss) {
        // remove old css
        $uiRouterCss.removedLinks.forEach(function (element) {
            element.remove();
        });
    }

    function setLinkEvent(link, callback) {
        if (link.addEventListener) {
            link.addEventListener('load', callback, false);
        }
        else {
            link.onload = callback;
        }
        //link.onreadystatechange = function () {
        //    var state = link.readyState;
        //    if (state === 'loaded' || state === 'complete') {
        //        link.onreadystatechange = null;
        //        CSSDonelog("onreadystatechange");
        //    }
        //};
    }

    function setStateResolve(state) {
        state.resolve = state.resolve || {};
        state.resolve[_appname] = ['$q', '$http', '$rootScope', '$state', '$uiRouterCss', function ($q, $http, $rootScope, $state, $uiRouterCss) {
            return $uiRouterCss.deferred.promise;
        }];
    }

    function setStateDefine(stateDefine, name, config) {
        var stateParts = getStatePartName(name);
        stateParts.pop();
        var parent = stateDefine[stateParts.join(_stateSeperator)];
        var css = uniqueArray(((parent && parent.css) || []).concat(config.css));
        stateDefine[name] = {
            name: name,
            css: css
        };
    }

    function getParentAndCurrentState($state, fromState, toState) {
        var result = [];
        var currentState = toState;

        while (currentState && currentState.name !== fromState.name) {
            result.push(currentState);
            currentState = getParentState($state, currentState);
        }

        return result.reverse();
    }

    function getParentState($state, state) {
        if (state && state.name && state.name !== '') {
            var stateParts = getStatePartName(state.name);
            stateParts.pop();
            return $state.get(stateParts.join(_stateSeperator));
        }
        return null;
    }

    function getStatePartName(name) {
        return name.split(_stateSeperator);
    }

    function uniqueArray(t) {
        var u = {}, a = [];
        for (var i = 0, l = t.length; i < l; ++i) {
            if (u.hasOwnProperty(t[i])) {
                continue;
            }
            a.push(t[i]);
            u[t[i]] = 1;
        }
        return a;
    }

    function log(a, b) {
        if (DEBUG)
            console.log(a, b);
    }

})(angular, false, 'ui.router.css', 'angular-ui-router-css', '__uiRouterCss', '__config', '.');