/* global angular */

(function() {
    'use strict';

    angular.module('redux-simplified', [])

        /*
        * inspired by Redux https://github.com/rackt/redux
        */
        .service("ImmutableStore", function() {

            return {
                /*  
                *   Creates a getter with memoization
                */
                createSelector: function(inputSelectorsArr, fn) {
                    var oldValuesArr = [];
                    var memo;
                    return function() {
                        var isInputUpdated = false;
                        var params = inputSelectorsArr.map(function(item, i){
                            var newVal = item();
                            isInputUpdated = isInputUpdated || newVal !== oldValuesArr[i];
                            oldValuesArr[i] = newVal;
                            return newVal;
                        });

                        return isInputUpdated ? memo = fn.apply(null, params) : memo;
                    };
                },

                /*  
                *   Creates a combined reducer
                */
                combineReducers: function (reducers) {

                    var reducersKeys = Object.keys(reducers);
                    return function(currentState, action) {
                        var hasChanged = false;
                        var nextState = reducersKeys.reduce(function(acc, cur) {
                            var prevStateForKey = currentState[cur];
                            var nextStateForKey = reducers[cur](prevStateForKey, action);
                            acc[cur] = nextStateForKey;
                            hasChanged = hasChanged || nextStateForKey !== prevStateForKey;
                            return acc;
                        }, {});

                        return hasChanged ? nextState : currentState;
                    };
                },

                /*  
                *   Creates a store from reducer and initial state
                */
                createStore: function(reducer, initialState) {
                    var currentState = initialState;

                    return {
                        get state() {
                            return currentState;
                        },
                        dispatch: function(action) {
                            currentState = reducer(currentState, action);
                        }
                    };
                }
            };
        })
    ;

})();

