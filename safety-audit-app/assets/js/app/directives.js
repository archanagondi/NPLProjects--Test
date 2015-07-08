'use strict';
/**
 * @ngdoc Directives 
 * @name npl.Directive:rcSubmit,showData,showAside
 * @description
 * Provides the DOM manuplation as per requirement.
 */

angular.module('npl')

  // Common Form Validation
  
  .directive('rcSubmit', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            require: ['rcSubmit', '?form'],
            controller: ['$scope', function ($scope) {
                this.attempted = false;
                
                var formController = null;
                
                this.setAttempted = function() {
                    this.attempted = true;
                };
                
                this.setFormController = function(controller) {
                  formController = controller;
                };
                
                this.needsAttention = function (fieldModelController) {
                    if (!formController) return false;
                    
                    if (fieldModelController) {
                        return fieldModelController.$invalid && (fieldModelController.$dirty || this.attempted);
                    } else {
                        return formController && formController.$invalid && (formController.$dirty || this.attempted);
                    }
                };
            }],
            compile: function(cElement, cAttributes, transclude) {
                return {
                    pre: function(scope, formElement, attributes, controllers) {
                      
                        var submitController = controllers[0];
                        var formController = (controllers.length > 1) ? controllers[1] : null;
                        
                        submitController.setFormController(formController);
                        
                        scope.rc = scope.rc || {};
                        scope.rc[attributes.name] = submitController;
                    },
                    post: function(scope, formElement, attributes, controllers) {
                      
                        var submitController = controllers[0];
                        var formController = (controllers.length > 1) ? controllers[1] : null;
                        var fn = $parse(attributes.rcSubmit);
                        
                        formElement.bind('submit', function (event) {
                            submitController.setAttempted();
                            if (!scope.$$phase) scope.$apply();
                            
                            if (!formController.$valid) return false;
                    
                            scope.$apply(function() {
                                fn(scope, {$event:event});
                            });
                        });
                    }
              };
            }
        };
    }]
  )
  
  // Place Modal content through http service
  .directive( 'showData', function ( $compile ) {
    return {
      scope: true,
      link: function ( scope, element, attrs ) {
        var el;
  
        attrs.$observe( 'template', function ( tpl ) {
          if ( angular.isDefined( tpl ) ) {
            // compile the provided template against the current scope
            el = $compile( tpl )( scope );
  
            // emptying the element
            element.html("");
  
            // add the template content
            element.append( el );
          }
        });
      }
    };
  })
  
  
  // Place Aside content through http service
  .directive( 'showAside', function ( $compile ) {
    return {
      scope: true,
      link: function ( scope, element, attrs ) {
        var el;
  
        attrs.$observe( 'template', function ( tpl ) {
          if ( angular.isDefined( tpl ) ) {
            // compile the provided template against the current scope
            el = $compile( tpl )( scope );
  
            // emptying the element
            element.html("");
  
            // add the template content
            element.append( el );
          }
        });
      }
    };
  })
  
  .directive('pinchZoom', function() {
      return {
        restrict : 'AE',
        scope    : true,
        link     : function (scope, element, attrs) {
            
            var elWidth = element[0].offsetWidth;
            var elHeight = element[0].offsetHeight;
            var vertex = computeVertexData(element[0]);
            //console.log(JSON.stringify(vertex));
            
            var mode = '';
            var distance = 0;
            var initialDistance = 0;
            
            var scale = 1;
            var relativeScale = 1;
            var initialScale = 1;
            var MAX_SCALE = 3;
            
            var positionX = 0;
            var positionY = 0;
         
            var initialPositionX = 0;
            var initialPositionY = 0;
           
            var originX = 0;
            var originY = 0;
         
            
            var startX = 0;
            var startY = 0;
            var moveX = 0;
            var moveY = 0;
              
            element.css({
                  '-webkit-transform-origin' : '0 0',
                  'transform-origin'         : '0 0'
            });
         
            element.on('touchstart', function(evt) {
                  startX = evt.touches[0].pageX;
                  startY = evt.touches[0].pageY;
                  initialPositionX = positionX;
                  initialPositionY = positionY;
                  moveX = 0;
                  moveY = 0;
                  mode = '';
                   if (evt.touches.length === 2) {
                       initialScale = scale;
                        initialDistance = getDistance(evt);
                        originX = evt.touches[0].pageX -
                                 parseInt((evt.touches[0].pageX - evt.touches[1].pageX) / 2, 10) -
                                 element[0].offsetLeft - initialPositionX;
                        originY = evt.touches[0].pageY -
                                 parseInt((evt.touches[0].pageY - evt.touches[1].pageY) / 2, 10) -
                                 element[0].offsetTop - initialPositionY;
                  }
            });
         
            element.on('touchmove', function(evt) {
                  evt.preventDefault();
                  vertex = computeVertexData(element[0]);
                  if (mode === 'swipe' && scale > 1) {             
                        moveX = evt.touches[0].pageX - startX;
                        moveY = evt.touches[0].pageY - startY;
                        positionX = initialPositionX + moveX;
                        positionY = initialPositionY + moveY;
                        transformElement();
                        
                  } else if (mode === 'pinch') {
                        
                        distance = getDistance(evt);
                        relativeScale = distance / initialDistance;
                        scale = relativeScale * initialScale;                  
                        
                        positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
                        positionY = originY * (1 - relativeScale) + initialPositionY + moveY;
                        transformElement();
                        
                  } else {
                        
                     if (evt.touches.length === 1) {
                          mode = 'swipe';
                        } else if (evt.touches.length === 2) {
                          mode = 'pinch';
                        }
                  }
                  
                  transformElement();
            });
               
         
            element.on('touchend', function(evt) {
                  vertex = computeVertexData(element[0]);
              
                  if (mode === 'pinch') {
                        if (scale < 1)
                        {
                              scale = 1;
                              positionX = 0;
                              positionY = 0;
                        }
                  }
                  transformElement(0.1);
            });
         
            function getDistance(evt) {
              var d = Math.sqrt(Math.pow(evt.touches[0].pageX - evt.touches[1].pageX, 2) +
                                Math.pow(evt.touches[0].pageY - evt.touches[1].pageY, 2));
              return parseInt(d, 10);
            }
            
            function computeVertexData (elem) {
              var boundingClient = elem.getBoundingClientRect();
                  var w = boundingClient.width / 2,
                      h = boundingClient.height / 2,
                      v = {
                          a: {x: -w, y: -h, z: 0},
                          b: {x: w, y: -h, z: 0},
                          c: {x: w, y: h, z: 0},
                          d: {x: -w, y: h, z: 0},
                          w : boundingClient.width,
                          h : boundingClient.height
                      };
                  return v;
            }
            
            
            function transformElement(duration) {
                  vertex = computeVertexData(element[0]);
                  if(vertex.w > 780 && vertex.h > 1048 ){
                        
                        /*
                         * let width = 980px, screen width = 780px ,positionX will cureent horizontal position, positionY will be vertical position
                         * now in left side movement of image position x will 100 so 
                         * 980 - 780  = 200 px extra max - size will be out of screen
                         * so when we will put limit of free movement to -145 to  -extra image width in case of x- movement
                         * Similary we have put limitation of on movement from -180 to -extra image height
                        */
                        
                        var extraImageWidth  = vertex.w - 740;
                        var extraImageHeight = vertex.h - 990;
             
                        if(positionX > -145 )
                        {     positionX = -145;
                        }
                        if (extraImageWidth <= Math.abs(positionX + 145)){
                              positionX = - (extraImageWidth +145);
                               // console.log(positionX);
                        }
                        if(positionY > -180){
                              positionY = -180;
                        }
                        if (extraImageHeight <= Math.abs(positionY + 180)){
                              positionY = - (extraImageHeight + 180);
                        }

             }else if(vertex.w < 780 && vertex.h < 1048 ){
                var extraScreenWidth  = 740 - vertex.w;
                var extraScreenHeight =  990 - vertex.h;
             
                if(positionX < -145 )
                {
                    positionX = -145;
                }
                if (extraScreenWidth <= positionX + 145){
                    positionX =  extraScreenWidth -145;
                }
                if(positionY < -180){
                    positionY = -180;
                }
                if (extraScreenHeight <= positionY + 180){
                    positionY = extraScreenHeight - 180;
                }
             
             }
                  var transition  = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '',
                      matrixArray = [scale, 0, 0, scale, positionX, positionY],
                      matrix      = 'matrix(' + matrixArray.join(',') + ')';
             
                  element.css({
                    '-webkit-transition' : transition,
                    'transition'         : transition,
                    '-webkit-transform'  : matrix + ' translate3d(0,0,0)',
                    'transform'          : matrix
                  });
            }
        }
      };
    });