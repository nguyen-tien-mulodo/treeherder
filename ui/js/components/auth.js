"use strict";


treeherder.component("login", {
    template: `
        <span class="dropdown"
              ng-if="$ctrl.user.loggedin">
          <button id="logoutLabel" title="Logged in as: {{user.email}}" role="button"
                  data-toggle="dropdown" data-target="#"
                  class="btn btn-view-nav btn-right-navbar nav-persona-btn">
            <div class="nav-user-icon">
              <span class="fa fa-user pull-left"></span>
            </div>
            <span class="fa fa-angle-down lightgray"></span>
          </button>
          <ul class="dropdown-menu" role="menu" aria-labelledby="logoutLabel">
              <li>
                <a ng-click="$ctrl.logout()">Logout</a>
              </li>
          </ul>
        </span>

        <a class="btn btn-view-nav btn-right-navbar nav-login-btn"
           ng-if="!$ctrl.user.loggedin"
           ng-click="$ctrl.login()">Login</a>
    `,
    bindings: {
        onUserChange: "&"
    },
    controller: function ($scope, $http, $location, $window, $localStorage) {
        this.user = {};
        $scope.user = this.user;
        $scope.onUserChange = this.onUserChange;

        this.login = function () {
            console.log("logging in with TC");
            var hash = encodeURIComponent("#");
            var colon = encodeURIComponent(":");
            var target = `${$location.protocol()}${colon}//${$location.host()}${colon}${$location.port()}/${hash}/login`;
            var description = "Treeherder";
            var url = `https://login.taskcluster.net/?target=${target}&description=${description}`;
            delete $localStorage.auth;

            $window.open(url, "_blank");
        };

        $scope.$watch(function () { return $localStorage.auth; }, function () {
            console.log("LocalStorage auth Changed", $localStorage.auth);
            if ($localStorage.auth) {
                _.extend($scope.user, {
                    loggedin: true,
                    email: $localStorage.auth.clientId.split("/")[1],
                    isSheriff: true
                });
                _.extend($scope.user, $localStorage.auth);
                $scope.onUserChange({$event: {user: $scope.user}});
                console.log("logged in now", $scope.user);
            }
        });

        this.logout = function () {
            console.log("logging out with TC");
            delete $localStorage.auth;
            this.user = {};
            this.onUserChange({$event: {user: this.user}});
        };
    }
});

treeherder.service('loginCallback', ['$localStorage', '$location', '$window',
                   function($localStorage, $location, $window) {

    $localStorage.auth = {
        clientId: $location.search().clientId,
        accessToken: $location.search().accessToken,
        certificate: $location.search().certificate
    };

    $window.close();
}]);
