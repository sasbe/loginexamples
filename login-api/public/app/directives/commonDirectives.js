(function() {
    'use strict';

    angular
        .module('CommonDirectives', [])
        .directive("customSort", function() {
            return {
                restrict: 'A',
                transclude: true,
                scope: {
                    order: '=',
                    sort: '='
                },
                template: ' <a ng-click="sort_by(order)" style="color: #555555;">' +
                    '    <span ng-transclude></span>' +
                    '    <i ng-class="selectedCls(order)"></i>' +
                    '</a>',
                link: function(scope) {
                        // change sorting order
                        scope.sort_by = function(newSortingOrder) {
                            var sort = scope.sort;

                            if (sort.sortingOrder == newSortingOrder) {
                                sort.reverse = !sort.reverse;
                            }

                            sort.sortingOrder = newSortingOrder;
                        };


                        scope.selectedCls = function(column) {
                            if (column == scope.sort.sortingOrder) {
                                return ('fa fa-chevron-' + ((scope.sort.reverse) ? 'down' : 'up'));
                            } else {
                                return 'fa fa-sort'
                            }
                        };
                    } // end link
            }
        })
        .directive('nepalimoneyreadonly', function() {
            return {
                replace: true,
                restrict: "E",
                scope: {
                    money: "@"
                },
                link: function(scope, el, attr, ngModel) {
                    attr.$observe('money', function(actual_value) {
                        $(el).text(accounting.formatMoney(scope.money));
                    })
                },
                template: "<span></span>"
            }

        })
        .directive('nepalimoney', function() {
            var NUMBER_REGEXP = /[+-]?([0-9]*[.])?[0-9]+/g;
            return {
                replace: true,
                require: "ngModel",
                restrict: "E",
                link: function(scope, element, attrs, ctrl) {
                    element.on("focus", function(event) {
                        element.val(accounting.unformat(element.val()));
                    }).on("blur", function(event) {
                        element.val(accounting.formatMoney(element.val()));
                    });
                    ctrl.$render = function() {
                        element.val(accounting.formatMoney(ctrl.$modelValue));
                    }
                    ctrl.$validators.money = function(modelValue, viewValue) {
                        return NUMBER_REGEXP.test(viewValue);
                    };
                },
                template: '<input type="text" class="form-control">'
            }

        })
        .directive('nepalidatereadonly', function() {
            return {
                replace: true,
                restrict: "E",
                scope: {
                    date: "@"
                },
                link: function(scope, el, attr, ngModel) {
                    attr.$observe('date', function(actual_value) {
                        if (actual_value) {
                            var localeDate = new Date(actual_value)
                            $(el).text(AD2BS(localeDate.getFullYear() + "-" + (localeDate.getMonth() + 1) + "-" + localeDate.getDate()));
                        }
                    })

                },

                template: "<span></span>"
            }

        })
        .directive('nepalidatepicker', function() {
            return {
                replace: true,
                require: "ngModel",
                restrict: "E",
                link: function(scope, element, attrs, ctrl) {
                    var inputField = $("input", element);
                    inputField.on("keydown", function() {
                        return false;
                    })
                    inputField.attr("id", Date.now())
                        .nepaliDatePicker({
                            onFocus: true,
                            npdMonth: true,
                            npdYear: true,
                            onChange: function() {
                                ctrl.$setViewValue(BS2AD(inputField.val()));
                            },
                            disableBefore: '01/01/2069'
                        });
                    $("i", element).on("click", function() {
                        showNdpCalendarBox(inputField.attr("id"));
                    });
                    ctrl.$render = function() {
                        if (ctrl.$modelValue) {
                            var localeDate = new Date(ctrl.$modelValue)
                            inputField.val(AD2BS(localeDate.getFullYear() + "-" + (localeDate.getMonth() + 1) + "-" + localeDate.getDate()));
                        }
                    }
                },
                template: '<div class="datepicker"><input type="text"  class="form-control "><i class="ndp-click-trigger fa fa-calendar" aria-hidden="true" ngclick="opendatePicker"></i></div>'
            }

        })
        .directive('number', function() {
            var NUMBER_REGEXP = /^(\d+)$/;
            return {
                require: 'ngModel',
                restrict: "A",
                link: function(scope, elm, attrs, ctrl) {
                    ctrl.$validators.number = function(modelValue, viewValue) {
                        return NUMBER_REGEXP.test(viewValue);
                    };
                }
            };
        })
}());