'use strict';
/**
 * @ngdoc overview
 * @name Utilities
 * @description
 * # Utilities
 *
 * The module of the application that handles common utility functions.
 */
angular.module('utilities', []);

angular.module('utilities')
    .service('promiseUtil', function ($q) {
        function emptyPromise(success, error) {
            var deferred = $q.defer();

            setTimeout(function () {
                deferred.notify('');
                if (!error) {
                    deferred.resolve(success);
                } else {
                    deferred.reject(error);
                }
            }, 100);
            return deferred.promise;
        }

        return {
            emptyPromise: emptyPromise
        }
    })
    .service('stringUtil', function () {

        function replaceAll(string, pattern, value) {
            var regularExpression = new RegExp(pattern, 'g');

            string = string.replace(regularExpression, value);

            return string;
        }

        function removeSpacesAndCase(string) {
            string = replaceAll(string, ' ', '');
            string = string.toLowerCase();
            return string;
        }

        function contains(string, subString, exactMatch) {
            if (Object.prototype.toString.call(string) === '[object Array]') {
                if (_.contains(string, subString)) {
                    return true;
                }
                for (var i = 0, j = string.length; i < j; i++) {
                    var haystack = string[i];
                    if (!exactMatch) {
                        haystack = removeSpacesAndCase(haystack);
                        subString = removeSpacesAndCase(subString);
                    }
                    if (haystack.indexOf(subString) > -1) {
                        return true;
                    }
                }
            } else {
                if (!exactMatch) {
                    string = removeSpacesAndCase(string);
                    subString = removeSpacesAndCase(subString);
                }
                return string.indexOf(subString) > -1
            }
            return false;
        }

        function isString(string) {
            if (Object.prototype.toString.call(string) === '[object String]') {
                return true;
            }
            return false;
        }

        function toSinalCase(string) {
            if (Object.prototype.toString.call(string) !== '[object String]') {
                return '';
            }
            string = replaceAll(string, '([A-Z])', ' $1'); //add space before upper case characters
            string = string.toLowerCase(); //lower case
            string = replaceAll(string, '[^a-z -]', ''); //remove all non alpha characters
            string = string.replace(/\s+/g, ' '); //remove extra space
            string = replaceAll(string, ' ', '-'); //replace single space with dash
            return string;
        }

        function toCamelCase(string) {
            /*
             * The ECMAScript standard to find the class of Object (to use the toString method from Object.prototype)
             * is how we detect if the identifier is a valid return.
             */
            if (Object.prototype.toString.call(string) !== '[object String]') {
                return '';
            }
            string = replaceAll(string, '-', ' '); //replace dash with single space
            string = replaceAll(string, '([A-Z])', ' $1'); //add space before upper case characters
            string = string.toLowerCase(); //lower case
            string = replaceAll(string, '[^a-z ]', ' '); //remove all non alpha characters and replace with a space
            /*
             * Find all of the word boundaries and change the case for each  found 'word' to upper case
             */
            string = string.replace(/\b[a-z](?=[a-z])/g, function (firstLetter) {
                return firstLetter.toUpperCase();
            });
            string = string.replace(/\s+/g, ''); //remove all spaces
            /*
             * If a string is one or less characters long then change the case of the entire string to lower case
             * else change the case of the first character to lower case
             */
            if (string.length <= 1) {
                string = string.toLowerCase();
            } else {
                string = string.substring(0, 1).toLowerCase() + string.substring(1);
            }
            return string;
        }

        function isEmptyOrNull(string, allowString) {
            if (string && isString(string)) {
                if (string.toLowerCase() === 'null' && !allowString) {
                    return true;
                } else if (string === null) {
                    return true;
                } else if (string.toLowerCase() === 'undefined' && !allowString) {
                    return true;
                } else if (typeof string === 'undefined') {
                    return true;
                } else if (string.trim() === '' || string.trim().length <= 0) {
                    return true;
                } else {
                    return false;
                }
            } else if (!string || typeof string === 'undefined' || string === null) {
                return true;
            } else if (_.isEmpty(string) && (Object.prototype.toString.call(string) === '[object Object]' || Object.prototype.toString.call(string) === '[object Array]')) {
                return true;
            }
            return false;
        }


        return {
            replaceAll: replaceAll,
            contains: contains,
            isString: isString,
            toSinalCase: toSinalCase,
            toCamelCase: toCamelCase,
            isEmptyOrNull: isEmptyOrNull
        }
    });