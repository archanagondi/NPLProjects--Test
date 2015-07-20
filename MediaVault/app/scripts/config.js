'use strict'; 

/**
* @ngdoc overview 
* @name Configuration 
* @description
* # Configuration
*
* Module that defines global variables.
*
* Set in GruntFile.js
*/ 

 angular.module('config', [])

.constant('ENV', {name:'development',version:'1.0.0',server:'https://api-dev3.gonpl.com/mediavault/',appName:'MediaVault',apiVersion:'v2',locale:'en'})

;