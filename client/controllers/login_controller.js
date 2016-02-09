(function() {
  "use strict";

  angular
    .module("fishinApp")
    .controller("LoginController", LoginController);

  LoginController.$inject = ["$state", "userDataService", "$log"];

  function LoginController($state, userDataService, $log) {
    var vm = this;

    vm.user   = userDataService;
    vm.logIn  = logIn;

    vm.userHold = {
      name: "",
      phoneNumber: ""
    };

    function logIn(name) {
      $log.debug("Logging in:", vm.userHold.name);

      // Log in the user by updating the service's .name:
      vm.user.name        = vm.userHold.name;
      vm.user.phoneNumber = vm.userHold.phoneNumber
      vm.userHold.name    = "";

      $state.go("triumphs");
    }
  }

})();
