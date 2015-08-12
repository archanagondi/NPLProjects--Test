'use strict';

/* Services */

angular.module('npl')

   // Service to maintain User Session after Login
  .service('Session', function () {
	    
            this.setSession = function(displayName, employeeID, sAMAccountName,groups, token,area){
                this.employeeName = displayName;
                this.employeeID = employeeID;
                this.accountName = sAMAccountName;
                this.group = groups;
                this.token = token;
                this.area = area;
            };
            this.create = function (displayName, employeeID, sAMAccountName,groups,token, area) {
				//session store in sessionStorage
				sessionStorage.setItem("employeeName" , displayName);
				sessionStorage.setItem("employeeID" , employeeID);
				sessionStorage.setItem("accountName" , sAMAccountName);
				sessionStorage.setItem("group" , groups);
				sessionStorage.setItem("token" , token);
				sessionStorage.setItem("area" , area);
              this.setSession(displayName, employeeID, sAMAccountName,groups,token, area);
              
            };
            this.destroy = function () {
				//session destroy from sessionStorage
				sessionStorage.clear();	
				
				this.emkployeeName = null;
				this.employeeID = null;
				this.accountName = null;
				this.group = null;
				this.token = null;
				this.area = null;
            };
            return this;
            
            }
	);
  
