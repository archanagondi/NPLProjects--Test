'use strict';

/**
 * @ngdoc service
 * @name MediaVault.factory: User
 * @description
 * The factory that generates User objects.
 */

angular.module('MediaVault').factory('Uploaddata', function () 
{
    var Uploaddata = function (id,area,job,phase,date,department,street,city,zip,note,keyword,imagename,imagepath,status) {
        this.id=id;
		this.area = area;
		this.job = job;
		this.phase = phase;
		this.date = date;
		this.department = department;
		this.street = street;
		this.city = city;
		this.zip = zip;
		this.note = note;
		this.keyword = keyword;
		this.imagename=imagename;
		this.imagepath=imagepath;
		this.status=status;
    };

	return Uploaddata;

});
