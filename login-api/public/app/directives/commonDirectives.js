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
            return {
                replace: true,
                require: "ngModel",
                restrict: "E",
                link: function(scope, element, attrs, ngModel) {
                    element.on("focus", function(event) {
                        element.val(accounting.unformat(element.val()));
                    }).on("blur", function(event) {
                        element.val(accounting.formatMoney(element.val()));
                    });
                    ngModel.$render = function() {
                        if (ngModel.$modelValue) {
                            element.val(accounting.formatMoney(ngModel.$modelValue));
                        }
                    }
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
                link: function(scope, element, attrs, ngModel) {
                    var inputField = $("input", element);
                    inputField.attr("id", Date.now())
                        .nepaliDatePicker({
                            onFocus: false,
                            npdMonth: true,
                            npdYear: true,
                            onChange: function() {
                                ngModel.$setViewValue(BS2AD(inputField.val()));
                            },
                            disableBefore: '01/01/2069'
                        });
                    $("i", element).on("click", function() {
                        showNdpCalendarBox(inputField.attr("id"));
                    });
                    ngModel.$render = function() {
                        if (ngModel.$modelValue) {
                            var localeDate = new Date(ngModel.$modelValue)
                            inputField.val(AD2BS(localeDate.getFullYear() + "-" + (localeDate.getMonth() + 1) + "-" + localeDate.getDate()));
                        }
                    }
                },
                template: '<div class="datepicker"><input readonly="readonly" type="text"  class="form-control "><i class="ndp-click-trigger fa fa-calendar" aria-hidden="true" ngclick="opendatePicker"></i></div>'
            }

        });
}());