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
        feedback: 'feedback',
        signin: 'signin',
        signout: 'signout',
        releaseNotes: 'releaseNotes',
        areas: 'areas',
        jobsandphases: 'jobsAndPhases',
		getcategories: 'getCategories',
		getkeywords: 'getKeywords'
		
		
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