'use strict';
/**
 * @ngdoc overview
 * @name MediaVault.service: Authentication
 * @description
 * # Authentication
 *
 * The module of the application that handles signin and signout of the application checking online/offline status.
 */
angular.module('MediaVault').service('access', function (ENV, ENDPOINTS, ERRORS, $state, nplApi, localRecord) {
    var access = this;
    access.user = localRecord.get('user');

    function isSignedIn() {
        access.user = localRecord.get('user');
        if (access.user && access.user.id) {
            if (!hasToken()) {
                return false;
            } else {
                return true;
            }
        }
        return false;
    }

    function hasToken() {
        if (access.user && access.user.id && access.user.token) {
            return true;
        }
        return false;
    }

    function getToken() {
        if (access.user && access.user.token) {
            return access.user.token;
        }
        return;
    }

    function setToken(token) {
        if (access.user) {
            access.user.token = token;
            localRecord.save('user', access.user);
        }
    }

    function clearUser() {
        localRecord.remove('user');
    }

    function clearLastesUser() {
        localRecord.remove('login');
    }

    function setLatestUser(username) {
        localRecord.save('login', {username: username});
    }

    function signIn(username, password, callback) {
        clearUser();

        var body = {
            'username': username,
            'password': password,
            'app_name': ENV.appName,
            'app_version': ENV.version
        };

        nplApi.post(ENDPOINTS.signin, body)
            .then(function (response) {
                access.user = localRecord.parse('user', response.data);

                localRecord.save('user', access.user);
                setLatestUser(username);
                if (callback) {
                    callback(null);
                }

            }, function (e) {
                if (callback) {
                    callback(e);
                }
            });

    }

    function signOut() {
        clearUser();
        access.user = localRecord.get('user');
        $state.go('login');
        nplApi.post(ENDPOINTS.signout, {});
    }

    return {
        isSignedIn: isSignedIn,
        hasToken: hasToken,
        getToken: getToken,
        setToken: setToken,
        clearUser: clearUser,
        clearLastesUser: clearLastesUser,
        signIn: signIn,
        signOut: signOut
    };
});