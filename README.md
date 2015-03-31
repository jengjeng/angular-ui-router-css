# angular-ui-router-css
CSS Resolver for AngularJS UI Router.
Resolve your css before route state changed.
Installation
-------------
Install and manage with [Bower](http://bower.io/). 
```sh
bower instal angular-ui-router-css --save
```
How to use it
-------------
1) Include `angular-ui-router-css.js` to your page.
```sh
<script src="angular-ui-router-css.js"></script>
```
2) Add `ui.router.css` to your main module's list of dependencies (requires [AngularUI Router](https://github.com/angular-ui/ui-router) as a dependency)
```sh
angular.module('app', ['ui.router', 'ui.router.css']);
```
Examples
-------------
```sh
angular.module('app').config(function($stateProvider) {
  $stateProvider
    .state('page1', {
      url: '/page1',
      templateUrl: 'page1/page1.html',
      css: 'page1/page1.css'
    })
    .state('page2', {
      url: '/page2',
      templateUrl: 'page2/page2.html',
      css: ['page2/layout.css', 'page2/page2.css']
    })
    .state('page2.child', {
      url: '/child',
      templateUrl: 'page2/page2.child.html',
      css: ['page2/page2.child.css']
    })
});
```
### Result
- `/page1` => `page1/page1.css`
- `/page2` => `page2/layout.css`, `page2/page2.css`
- `/page2/child` => `page2/layout.css`, `page2/page2.css`, `page2/page2.child.css`
