'use strict';

describe('Directive: queue', function () {

  // load the directive's module
  beforeEach(module('mediaVaultApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<queue></queue>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the queue directive');
  }));
});
