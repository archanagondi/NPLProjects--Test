'use strict';

/**
 * @ngdoc overview
 * @name Constants
 * @description
 * # Constants
 *
 * Module that defines global variables.
 *
 */

angular.module('constants', [])
    .constant('ENDPOINTS', {
        feedback: 'api.php?endpoint=feedback',
        signin: 'api.php?endpoint=signin',
        signout: 'api.php?endpoint=signout',
        releaseNotes: 'api.php?endpoint=releaseNotes',
        areas: 'api.php?endpoint=areas',
        jobsandphases: 'api.php?endpoint=jobsAndPhases',
        getcategories: 'MediaVault/api.php?endpoint=getCategories',
        getkeywords: 'MediaVault/api.php?endpoint=getKeywords',
        getgeoLocation: 'api.php?endpoint=getGeoLocation',
		//office 365 services end points 
		accesstoken: 'api.php?endpoint=accessToken',
		createfolder: 'api.php?endpoint=createFolder',
		listfoldercontents:'api.php?endpoint=listFolderContents',
		uploadfile : 'api.php?endpoint=uploadFile',
		downloadfile: 'api.php?endpoint=downloadFile',
		deletefile: 'api.php?endpoint=deleteFile',
		searchfile: 'api.php?endpoint=searchFile'
    })

//String Display Messages
    .constant('ERRORS', {
        feedback: {
            postFailed: 'There was a problem submitting your feedback. Please try again.',
            offline: 'You are offline and cannot submit feedback.'
        },
        login: {
            apiUnreachable: 'Could not contact Central Office. Please try again.',
            incomplete: 'Please fill in the proper fields.',
            missingADGroup: 'Unauthorized: You do not have permission to access this site.',
            missingId: 'Missing employee id.',
            missingUsername: 'Username not found',
            offline: 'You must be online to use Media Vault.'
        },
        releaseNotes: {
            getFailed: 'There was an error getting the release notes'
        }
    })
    .constant('MESSAGES', {
        feedback: {
            sendSuccess: 'The feedback was sent successfully.',
        }

    })
    .constant('LABELS', {
        main: {
            pageTitle: 'Media Vault',
        },
        alertDialog: {
            defautlButton: 'Okay',
            defautlTitle: 'Alert'
        }
    });