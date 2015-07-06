'use strict';
/**
 * @ngdoc overview
 * @name Router
 * @description
 * # Router
 *
 * Router module of the application. All routes for the application are defined here.
 */
angular.module('securityRoute', ['ui.router']).config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
    }).state('main', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    });
});