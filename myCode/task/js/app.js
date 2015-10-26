'use strict';

var app=angular.module("myApp",["ngRoute",'ngAnimate','taskController',"taskServices",'ngMessages',"taskDirective"]);

//config
app.config(["$routeProvider",function($routeProvider){
	$routeProvider.when("/list",{
		templateUrl:"./partials/list.html",
		controller:"listController"
	}).when("/tree",{
		templateUrl:"./partials/tree.html",
		controller:"treeController"
	}).otherwise({
		redirectTo:"/list"
	});

}]);  


app.controller("navBarController",function($scope,$rootScope){

	var navBar={type:0};  

	navBar.navClick=function(type){
	    navBar.type=type; 
	    $scope.$emit("typeChange", type);
	} 

	navBar.add=function(event){
		if (event.keyCode==13) {
			 $scope.$emit("addItem", $(event.target).val()); 
			 $(event.target).val("");
		}; 
	}

	navBar.select=function(type){ 
		return type==navBar.type; 
	} 


	navBar.doSomething=function(a,c,d){
		console.log(123);
	}

	$scope.navBar=navBar;

	$scope.title = '点击展开';
    $scope.text = '这里是内部的内容。';

    //accordion
    $scope.expanders = [{
        title : 'Click me to expand',
        text : 'Hi there folks, I am the content that was hidden but is now shown.'
    }, {
        title : 'Click this',
        text : 'I am even better text than you have seen previously'
    }, {
        title : 'Test',
        text : 'test'
    }];

    $scope.click=function(){
    	console.log(1);
    }

 		$scope.$on("dirEvent",function (event, name) { 
          console.log(123);
      }); 



}).controller("rootController",function($scope){

	  $scope.$on("typeChange",function (event, type) { 
          $scope.$broadcast("typeChangeFromParrent", type);
      }); 
	 

	    $scope.submitForm = function(isValid) {

	    		//$scope.myForm.name.$viewValue

	    		//$scope.myForm.$invalid

	    		//$scope.myForm.$dirty /$scope.myForm.name.$error.required

                if (!isValid) {
                    alert('验证失败');
                }else{
                	console.log("验证成功");
                }
            };


      $scope.$on("addItem",function (event, name) { 
          $scope.$broadcast("addItemFromParent", name);
      }); 

});

 

//controller
var taskController=angular.module("taskController",[]);  


taskController.controller("listController",function($scope,Task){ 

	var data={ isLoading:true}; 

	data.remove=function(el){ 
		data.tasks.removeByKey("id",el.item.id); 
	} 

	data.add=function(){

	}

	$scope.$on("typeChangeFromParrent",function (event, type) {  
        data.tasks = Task.query({type:"123"}); 
        data.isLoading=false;
    });  

    $scope.$on("addItemFromParent",function (event, name) {  
        
        data.tasks.push({name:name,age:name});
    });  





	$scope.data=data;

    data.tasks = Task.list(); 

    data.isLoading=false;
 

});

taskController.controller("treeController",function($scope){
	$scope.name="tree";
});



 

/* Services */

var taskServices = angular.module('taskServices', ['ngResource']);

taskServices.factory('Task', ['$resource','$routeParams',

  function($resource,$routeParams){
  	
  	var type="lol";
  	
  	if ($routeParams.type) {
  		type=$routeParams.type;
  	};

    return $resource('TaskJson/:taskId.json', {}, {
    	query: {method:'GET', params:{taskId:type}, isArray:true},
        list:{method:'GET', params:{taskId:'list'}, isArray:true}
    });



  }]);

 

 //移除数组中的某元素
Array.prototype.removeByKey = function (key, value) {
    var arrayCount = this.length;
    for (var i = 0; i < arrayCount; i++) {
        if (this[i][key] == value) {
            this.splice(i, 1);
            break;
        }
    }
    return this;
};


//

var taskDirective = angular.module('taskDirective',[]);

taskDirective.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    //scope.$eval(attrs.myEnter);
                    attrs.myEnter(event);
                }); 
                event.preventDefault();
            }
        });
    };
});

taskDirective.directive('hello', function() {
    return {
        restrict: 'E',
        template: '<div>Hi there<span ng-transclude></span></div>',
        replace: true,
        transclude: true
    };
});

taskDirective.directive('expander2', function() {
    return {
        restrict : 'EA',
        replace : true,
        transclude : true,
        scope : {
            title : '=expanderTitle',
            action:"&"
        },
        template : '<div>'
                 + '<div class="title" ng-click="toggle()">{{title}}</div>'
                 + '<div class="body" ng-show="showMe" ng-transclude></div>'
                 + '</div>',
        link : function(scope, element, attrs) {
            scope.showMe = false;
            scope.toggle = function toggle() {
                scope.showMe = !scope.showMe; 
                scope.$emit("dirEvent"); 
            }
        }
    }
});


taskDirective.directive('accordion', function() {
    return {
        restrict : 'EA',
        replace : true,
        transclude : true,
        template : '<div ng-transclude></div>',
        controller : function() {
            var expanders = [];
            this.gotOpened = function(selectedExpander) {
                angular.forEach(expanders, function(expander) {
                    if (selectedExpander != expander) {
                        expander.showMe = false;
                    }
                });
            }
            this.addExpander = function(expander) {
                expanders.push(expander);
            }
        }
    }
});


taskDirective.directive('expander', function() {
    return {
        restrict : 'EA',
        replace : true,
        transclude : true,
        require : '^?accordion',
        scope : {
            title : '=expanderTitle',
            action:'&'
        },
        template : '<div>'
                   + '<div class="title" ng-click="toggle()">{{title}}</div>'
                   + '<div class="body animate-show"  action="action" ng-show="showMe" ng-transclude></div>'
                   + '</div>',
        link : function(scope, element, attrs, accordionController) {
            scope.showMe = false;
            accordionController.addExpander(scope);
            scope.toggle = function toggle() { 
                scope.showMe = !scope.showMe;
                accordionController.gotOpened(scope);
                scope.$emit("dirEvent"); 
            }
        }
    }
});


//  jQuery 的扩展支持冒泡
taskDirective.directive('ngBlur', function($parse){
    return function($scope, $element, $attr){
        var fn = $parse($attr['ngBlur']);
        $element.on('focusout', function(event){
            fn($scope, {$event: event});
        });
    }
});

taskDirective.directive('draggable', function($document) {
    var startX=0, startY=0, x = 0, y = 0;
    return function(scope, element, attr) {
      element.css({
       position: 'relative',
       border: '1px solid red',
       backgroundColor: 'lightgrey',
       cursor: 'pointer'
      });
      element.bind('mousedown', function(event) {
        startX = event.screenX - x;
        startY = event.screenY - y;
        $document.bind('mousemove', mousemove);
        $document.bind('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    }
 });


 taskDirective.directive('multipleEmail', [function () {
      return {
          require: "ngModel",
          link: function (scope, element, attr, ngModel) {
              if (ngModel) {
                  var emailsRegexp = /^([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*[;；]?)+$/i;
              }
              var customValidator = function (value) {
                  var validity = ngModel.$isEmpty(value) || emailsRegexp.test(value);
                  ngModel.$setValidity("multipleEmail", validity);
                  return validity ? value : undefined;
              };
              ngModel.$formatters.push(customValidator);
              ngModel.$parsers.push(customValidator);
          }
      };
  }])