'use strict';

var loggingModule = angular.module('talis.services.logging', []);

/**
 * Service that gives us a nice Angular-esque wrapper around the
 * stackTrace.js pintStackTrace() method. 
 */
loggingModule.factory(
    "traceService",
    function(){
        return({
            print: printStackTrace
        });
    }
);

/**
 * Override Angular's built in exception handler, and tell it to 
 * use our new exceptionLoggingService which is defined below
 */
loggingModule.provider(
    "$exceptionHandler",{
        $get: function(exceptionLoggingService){
            return(exceptionLoggingService);
        }
    }
);

/**
 * Exception Logging Service, currently only used by the $exceptionHandler
 * it preserves the default behaviour ( logging to the console) but 
 * also posts the error server side after generating a stacktrace.
 */
loggingModule.factory(
    "exceptionLoggingService",
    ["$log","$window", "traceService","$http",
    function($log, $window, traceService, $http){
        function error(exception, cause){

            // preserve the default behaviour which will log the error
            // to the console, and allow the application to continue running.
            $log.error.apply($log, arguments);

            // now try to log the error to the server side.
            try{
                var errorMessage = exception.toString();

                // use our traceService to generate a stack trace
                var stackTrace = traceService.print({e: exception});

                // use AJAX (in this example jQuery) and NOT 
                // an angular service such as $http 
                $http({
                    url: "/logger",
                    method: "POST",
                    params: angular.toJson({
                        url: $window.location.href,
                        message: errorMessage,
                        type: "exception",
                        stackTrace: stackTrace,
                        cause: ( cause || ""),
                    headers: { 'Accept' : 'application/json' } 
                    })
                });
            } catch (loggingError){
                $log.warn("Error server-side logging failed");
                $log.log(loggingError);
            }
        }
        return(error);
    }]
);

/**
 * Application Logging Service to give us a way of logging 
 * error / debug statements from the client to the server.
 */
loggingModule.factory(
    "applicationLoggingService",
    ["$log","$window",function($log, $window){
        return({
            error: function(message){
                // preserve default behaviour
                $log.error.apply($log, arguments);
                // send server side
                $http({
                    url: "/logger",
                    method: "POST",
                    params: angular.toJson({
                        url: $window.location.href,
                        message: message,
                        type: "error"
                    })
                });
            },
            debug: function(message){
                $log.log.apply($log, arguments);
                $http({
                    url: "/logger",
                    method: "POST",
                    params: angular.toJson({
                        url: $window.location.href,
                        message: message,
                        type: "debug"
                    })
                });
            }
        });
    }]
);