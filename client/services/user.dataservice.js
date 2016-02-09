(function() {
  "use strict";

  angular
    .module("fishinApp")
    .factory("userDataService", userDataService);

  userDataService.$inject = [];

  function userDataService() {
    var user = {
      name:        "",
      phoneNumber: "",
      isLoggedIn:  isLoggedIn
    };

    return user;

    function isLoggedIn() {
      return user.name.length !== 0;
    }
  }

})();
