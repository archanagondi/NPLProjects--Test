'use strict';

/**
 * @ngdoc function
 * @name MediaVault.controller: FeedbackCtrl
 * @description
 * # FeedbackCtrl
 * Controller to handle the feedback form
 */

angular.module('MediaVault').controller('queueCtrl', function (LABELS,coreservices,$filter, $scope,$state, localRecord, access, $rootScope,$interval) {
	
	
	console.log($rootScope.queuelist);
	
	$scope.deleteRecordId = function(divId)
	{$rootScope.deleteId = divId;
	};
//it will call the method every 3 minutes it will check wifi if it is avaliable 
//if data is avaliable in queue it will call upload web service if not it wont do any thing 
//$interval(calluploadService,300000);

//$interval(accesstokenupdate,3000);
$("#queue-tab").click(function(){
	calluploadService();
	$('.progress-bar-success').css('background-color', "#5cb85c");
	$('.progress-bar-success').css('width', '0%');
});
function calluploadService() 
{		
//alert(dateTime);
	   /*  var networkState = navigator.network.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection'; 
         if (states[networkState] == "WiFi connection") 
		 {
	$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
  $rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
  console.log($rootScope.folderdetails);
 
  $scope.folderld = $rootScope.folderdetails.data.folderId;
  $scope.folderName = $rootScope.folderdetails.data.folderName;  

  angular.forEach($rootScope.queuelist, function(value,key)
        {
  if(value.status == "pending"){
  var dateTime=new Date().getTime();
  
   var error='';
   
   //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
    //var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city=ghfgh&phase=fgh&job=fgh&description=fghfg&workDate="+value.date+"&zip=45676&keywords=side walk&redirectUrl=http://localhost/api-v3/MediaVault";
   var str = "fileName="+dateTime+"&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workDate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&folderName="+$scope.folderName +"&fileExt=jpeg&base64Data="+value.imagepath;
   coreservices.fileupload($rootScope.accesstoken,str).then(function(downloadresponse)
   {
    $scope.download=angular.toJson(downloadresponse);
    
    console.log($scope.download);
    console.log('file is uploaded');
	 progress = 100;
     $('#'+key+' .progress-bar-success').css('width',progress+"%");
     $rootScope.queuelist[key]['status'] = "completed";
     console.log( $rootScope.queuelist);
     localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   }).catch(function(response){
    
     error='false'; 
    
    //window.clearInterval(interval);
    $('#'+key+' .progress-bar-success').css('background-color', "#BD4343");
   });  
   var progress = 0;
   var interval = setInterval(
   function(){
   
    if (progress == 95 || error == "false"){
    window.clearInterval(interval);
    }else{
     setProgress(++progress,key);
    }
   }, 400);
   //localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   console.log("updated Queue list"); 
   console.log($rootScope.queuelist); 
   console.log(localRecord.get('uploaddata').uploaddataCode); 
  }
  
  }); 
} */
$rootScope.accesstoken=angular.fromJson(localRecord.get('accesstokendata').accesstokendataCode);
  $rootScope.folderdetails = angular.fromJson(localRecord.get('folderdata').folderdataCode);
  console.log($rootScope.folderdetails);
 
  $scope.folderld = $rootScope.folderdetails.data.folderId;
  $scope.folderName = $rootScope.folderdetails.data.folderName;  
alert($scope.folderName);
  angular.forEach($rootScope.queuelist, function(value,key)
        {
  if(value.status == "pending"){
  var dateTime=new Date().getTime();
  alert(dateTime);
   var error='';
    var str = {
		accessToken:encodeURIComponent($rootScope.accesstoken),
		base64Data:"/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRQBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIAFACvAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APcKACgAoAKACgAoAcvSgB47UASL1oAetADx0oAkHWgB69aAJF6UAPHSgCQdaAHrQA9elAEg7UAPHWgB60ASDpQA8dqAJF60APXpQA8dKAJB1oAevWgB69KAJB0oAeOtAEi0APHSgB47UASL1oAetADx0oAkHWgB69aAJF6UAPHSgCQdaAHrQA9elAEg7UAPHWgB60ASDpQA8dqAJF60APXpQA8dKAJB1oAevWgB69KAJB2oAeOtAEi0APHSgB47UASL1oAetADx0oAkHWgB69aAJF6UAPHSgCQdaAHrQA9elAEg7UAPHWgB60AOoAKACgAoAKACgAoAKACgAoAKACgAoAKAPyr/AOC53/NE/wDuN/8AthQB7jQAUAFABQAUAFADh0oAeO1AEi9aAHrQA8dKAJB1oAevWgCRelADx0oAkHWgB60APXpQBIO1ADx1oAetAEg6UAPFAEi9aAHr0oAeOlAEg60APXrQA9elAEg7UAPHWgCRaAHjpQA8dqAJF60APWgB46UASDrQA9etAEi9KAHjpQBIOtAD1oAevSgCQdqAHjrQA9aAJB0oAeOtAEi9aAHr0oAeOlAEg60APXrQA9elAEg7UAPHWgCRaAHjpQA8dqAJF60APWgB46UASDrQA9etAEi9KAHjpQBIOtAD1oAevSgCQdqAHr1oAetADqACgAoAKACgAoAKACgAoAKACgAoAKACgD8q/wDgud/zRP8A7jf/ALYUAe40AFABQAUAFABQA4dKAHjtQBIvWgB60APHSgCQdaAHr1oAkXpQA8dKAJB1oAetAD16UASDtQA8daAHrQBIOlADx1oAkXrQA9elADx0oAkHWgB60APXpQBIO1ADx1oAkWgB46UAPHagCRetAD1oAeOlAEg60APXrQBIvSgB46UASDrQA9aAHr0oAkHagB69aAHrQBIOlADx1oAkXrQA9elADx0oAkHWgB60APXpQBIO1ADx1oAkWgB46UAPHagCRetAD16UAPHSgCQdaAHr1oAkXpQA8dKAJB1oAetADx0oAkHagB69aAHrQA6gAoAKACgAoAKACgAoAKACgAoAKACgAoA/Kv8A4Lnf80T/AO43/wC2FAHuNABQAUAFABQAUAOHSgB47UASL1oAetADx0oAkHWgB69aAJF6UAPHSgCQdaAHrQA9elAEg7UAPXrQA9aAJB0oAeOtAEi9aAHr0oAeOlAEg60APWgB69KAJB2oAeOtAEi0APHSgB47UASL1oAevSgB46UASDrQA9etAEi9KAHjpQBIOtAD1oAeOlAEg7UAPXrQA9aAJB0oAeOtAEi9aAHr0oAeOlAEg60APWgB69KAJB2oAeOtAEi0APHSgCQdqAHr1oAevSgB46UASDrQA9etAEi9KAHjtQBIOtAD1oAeOlAEg7UAPXrQA9aAHUAFABQAUAFABQAUAFABQAUAFABQAUAFAH5V/wDBc7/mif8A3G//AGwoA9xoAKACgAoAKACgBw6UAPHagCRetAD16UAPHSgCQdaAHr1oAkXpQA8dKAJB1oAetADx0oAkHagB69aAHrQBIOlADx1oAkXrQA9elADx0oAkHWgB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PXpQA8dqAJB1oAetADx0oAkHagB69aAJF6UAPHSgCQdaAHr1oAevSgB47UASDrQA9aAJB0oAeO1AEi9aAHrQA8dKAJB1oAevWgB69KAJB0oAeOtAEi0APXpQA8dqAJB1oAetADx0oAkHWgB69aAJF6UALQAUAFABQAUAFABQAUAFABQAUAFABQAUAflX/wAFzv8Amif/AHG//bCgD3GgAoAKACgAoAKAHDpQBIOtAD160APXpQBIOlADx1oAkWgB69KAHjtQBIOtAD1oAeOlAEgoAevWgCRelADx0oAkHWgB69aAHr0oAkHagB460APWgCQdKAHjtQBIvWgB60APHSgCQdaAHr1oAevSgCQdKAHjrQBItAD16UAPHagCQdaAHrQA8dKAJB1oAevWgCRelADx0oAkHWgB69aAHr0oAkHagB460APWgCQdKAHjtQBIvWgB60APHSgCQdaAHr1oAevSgCQdKAHjrQBItAD16UAPHagCRetAD1oAeOlAEg60APXrQBIvSgBaACgAoAKACgAoAKACgAoAKACgAoAKACgD8q/+C53/ADRP/uN/+2FAHuNABQAUAFABQAUAOHSgCQdaAHr1oAevSgCQdKAHjrQBItAD16UAPHagCQdaAHrQA8dKAJB1oAevWgCRelADx0oAkHWgB60APXpQBIO1ADx1oAetAEg6UAPHagCRetAD1oAeOlAEg60APXrQA9elAEg6UAPHWgCRaAHr0oAeO1AEi9aAHrQA8dKAJB1oAevWgCRelADx0oAkHWgB60APXpQBIO1ADx1oAetAEg6UAPHagCRetAD16UAPHSgCQdaAHr1oAevSgCQdKAHjrQBItADx0oAeO1AEi9aAHrQA8dKAJB1oAevWgCRelAC0AFABQAUAFABQAUAFABQAUAFABQAUAFAH5V/8Fzv+aJ/9xv8A9sKAP//Z",
		fileName:dateTime,
		folderId:$scope.folderld,
		fileExt:"jpeg",
		areaName:value.area,
		city:value.city,
		phase:value.phase,
		job:value.job,
		description:value.note,
		workDate:"2015-06-09T07:00:00Z",
		zip:"6us77",
		structures:"side",
		operation:"new",
		condition:"side",
		entities:"home"
		//version:'1.0.0'
		}; 
		//var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workdate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&redirectUrl=http://localhost/api-v3/MediaVault";
		//var str = "fileName=test&filePath=/images/1.jpg&areaName="+value.area+"&city=ghfgh&phase=fgh&job=fgh&description=fghfg&workDate="+value.date+"&zip=45676&keywords=side walk&redirectUrl=http://localhost/api-v3/MediaVault";
		// var str = "fileName="+dateTime+"&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workDate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&folderName="+$scope.folderName +"&fileExt=jpeg&base64Data=dfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffg"+value.imagepath;
		//var str = "accessToken="+$rootScope.accesstoken+"&fileName="+dateTime+"&areaName="+value.area+"&city="+value.city+"&phase="+value.phase+"&job="+value.job+"&description="+value.note+"&workDate="+value.date+"&zip="+value.zip+"&keywords="+value.keyword+"&operation=new&folderName="+$scope.folderName +"&fileExt=jpeg&base64Data=dfgdfgf"+value.imagepath;
		//str	= str+'&structures=side walk&condition=dfgdfg&entities=sdfgd';
	
	coreservices.fileupload(str).then(function(downloadresponse)
   {
		$scope.download=angular.toJson(downloadresponse);

		console.log($scope.download);
		console.log('file is uploaded');
		progress = 100;
		$('#'+key+' .progress-bar-success').css('width',progress+"%");
		$rootScope.queuelist[key]['status'] = "completed";
		console.log( $rootScope.queuelist);
		localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
   }).catch(function(response){
    
     error='false'; 
    
    //window.clearInterval(interval);
    $('#'+key+' .progress-bar-success').css('background-color', "#BD4343");
   });  
   var progress = 0;
   var interval = setInterval(
	   function(){
	   if (progress == 95 || error == "false"){
			window.clearInterval(interval);
			}else{
			 setProgress(++progress,key);
			}
	   }, 400);
			   //localRecord.save('uploaddata',angular.toJson($rootScope.queuelist)); 
			   console.log("updated Queue list"); 
			   console.log($rootScope.queuelist); 
			   console.log(localRecord.get('uploaddata').uploaddataCode); 
		  }else{
			setProgress(100,key);
		  }
	  
	  });         
	}
	function setProgress(percent,id){
		//bar.style.width = percent + "%";
		$('#'+id+' .progress-bar-success').css('width', percent+'%');
		/* if (percent > 90)
		bar.className = "bar bar-success";
		else if (percent > 50)
		bar.className = "bar bar-warning"; */
	}


});