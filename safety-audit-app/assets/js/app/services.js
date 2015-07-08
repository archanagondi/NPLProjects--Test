'use strict';

/* Services */

angular.module('npl')

   // Service to maintain User Session after Login
  .service('Session', function () {
	    
            this.setSession = function(displayName, employeeID, sAMAccountName,groups, token, area,userGroups){
                this.employeeName = displayName;
                this.employeeID = employeeID;
                this.accountName = sAMAccountName;
                this.group = groups;
                this.token = token;
                this.area = area;
                this.userGroups = userGroups;
            };
            this.create = function (displayName, employeeID, sAMAccountName,groups,token,area,userGroups) {
              localStorage.setItem("employeeName" , displayName);
              localStorage.setItem("employeeID" , employeeID);
              localStorage.setItem("accountName" , sAMAccountName);
              localStorage.setItem("group" , groups);
              localStorage.setItem("token" , token);
              localStorage.setItem("area" , area);
              localStorage.setItem("userGroups" , userGroups);
              
              this.setSession(displayName, employeeID, sAMAccountName,groups,token,area,userGroups);
              
            };
            this.destroy = function () {
              localStorage.clear();
              this.emkployeeName = null;
              this.employeeID = null;
              this.accountName = null;
              this.group = null;
              this.token = null;
              this.area = null;
              this.userGroups = null;
            };
            return this;
            
            }
	);
  
