'use strict';

/* Filters */

angular.module('npl')
  
  // formats a number as a latitude (e.g. 40.46... => "40°27'44"N")
  .filter('lat', function () {
      return function (input, decimals) {
          if (!decimals) decimals = 0;
          input = input * 1;
          var ns = input > 0 ? "N" : "S";
          input = Math.abs(input);
          var deg = Math.floor(input);
          var min = Math.floor((input - deg) * 60);
          var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
          return deg + "\u00B0 " + min + "' " + sec + '" ' + ns;
      }
  })

  // formats a number as a longitude (e.g. -80.02... => "80°1'24"W")
  .filter('lon', function () {
      return function (input, decimals) {
          if (!decimals) decimals = 0;
          input = input * 1;
          var ew = input > 0 ? "E" : "W";
          input = Math.abs(input);
          var deg = Math.floor(input);
          var min = Math.floor((input - deg) * 60);
          var sec = ((input - deg - min / 60) * 3600).toFixed(decimals);
          return deg + "\u00B0 " + min + "' " + sec + '" ' + ew;
      }
  })
	.filter('pagination', function(){
	 return function(input, start)
	 {
	  start = +start;
	  return input.slice(start);
	 };
	});
  
  ;
