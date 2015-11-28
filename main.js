'use strict';

var app = angular.module('swapiApp', []);

app.controller('mainCtrl', function($scope){
  $rootScope.$on('loading', function(event, message){
    $scope.loading = 1
    console.log(loading)
  })

  $scope.$on('helloMain', function(event, message){
    console.log(message.message)
  })
  

  // $scope.$on('sendingPlanet', function(event, planet){
  //   console.log('mainCtrl', planet)
  //   $scope.$broadcast('planetSent', planet)
  // });
});

app.directive('planetDisplay', function(){
  return {
    restrict: 'AE',
    templateUrl: (elem, attr) => 'planets.html',
    scope: {
      minResidents: "@"
    },
    controller: function( $scope, planetSrvc, $interval, $http, $rootScope){
      var url = "http://swapi.co/api/planets/";
      planetSrvc.grabPlanets(url).then(() => {
      })
      $scope.usablePlanets = [];
      $rootScope.$on('Planet Data', function(event, data){
        $scope.loading = 1
        console.log(data);
        $scope.planets = data.forEach(function(input){
          input = input.filter(function(planet){
            return planet.residents.length >= Number($scope.minResidents)
          })
          input.forEach(function(planet){
            $scope.usablePlanets.push(planet);
          })
        })
      });
      $scope.planetSelect = function(planet){
        $rootScope.$emit('sendingPlanet', planet)
      } 
    }
  }
});

app.directive('thisPlanet', function(){
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: (elem, attr) => 'planet.html',
    controller: function($scope, $rootScope){
      $scope.$emit('helloMain', {message: "Hello Main"})
      $rootScope.$on('sendingPlanet', function(event, planet){
        $scope.planet = planet
        $rootScope.$emit('sendingResidents', planet.residents)
      });

    }
  }
});

app.directive('chosenResident', function(){
  return {
    restrict: 'AE', 
    transclude: true,
    templateUrl: (elem, attr) => 'resident.html',
    controller: function($scope, $rootScope, $http){ 
      $rootScope.$on('sendingResidents', function(event, residents){        
        $scope.residents = [];
        residents.map(function(resident){
          resident = {url: resident}
          $http.get(resident.url).then(function(resp){
            resident.name = resp.data.name
            resident.height = resp.data.height
            resident.mass = resp.data.mass
            resident.gender = resp.data.gender
            resident.eye_color = resp.data.eye_color
            console.log(resident)
            $scope.residents.push(resident)
          })
        });
      });
    }
  }
});

app.service('planetSrvc', function($http, $rootScope){
  this.planetData = [];
  this.grabPlanets = function(url){
    return $http.get(url).then((resp) => {
      this.planetData.push(resp.data.results);
      if(this.planetData.length === 7){
        $rootScope.$emit('Planet Data', this.planetData);
        $rootScope.$emit('loading', 'loading complete')
      }
      if(resp.data.next !== null){
        console.log('getting next')
        this.grabPlanets(resp.data.next)
      }
    })
  }
})


