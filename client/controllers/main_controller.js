(function() {
  "use strict";

  angular
      .module("fishinApp")
      .controller("MainController", MainController);

  MainController.$inject = ["$state", "userDataService", "$log"];

  function MainController($state, userDataService, $log) {
    var vm = this;

    vm.user = userDataService;
    vm.logOut = logOut;

    function logOut() {
      $log.debug("Logging out:", vm.user.name);

      vm.user.name        = "";
      vm.user.phoneNumber = "";
      $state.go("homePage");
    }

    vm.$state = $state;

  }

})();
