/* global describe, it, expect, beforeEach, spyOn, module, inject */

describe("ImmutableStore Service", function() {
    "use strict";

    beforeEach(module('redux-simplified'));

    var ImmutableStore;
    beforeEach(function() {

        inject(function($injector) {
            ImmutableStore = $injector.get('ImmutableStore');
        });

    });

    it("should provide #createStore", function() {
        expect(ImmutableStore.createStore).toBeDefined();
        expect(typeof ImmutableStore.createStore).toBe("function");
    });

    describe("#createStore", function() {
        var store;
        var reducerSpy;
        function basicReducer(state, action){
            switch (action.type) {
                case "KNOWN":
                    return {
                        a: "A"
                    };
                default:
                    return state;
            }
        }
        var fakeObj = {
            basicReducer: basicReducer
        };

        var initialState;

        beforeEach(function() {
            initialState = {};
            reducerSpy = spyOn(fakeObj, "basicReducer").and.callThrough();
            store = ImmutableStore.createStore(fakeObj.basicReducer, initialState);
        });
        it("should return Obj with #dispatch", function() {
            expect(store).toBeDefined();
            expect(store.dispatch).toBeDefined();
            expect(typeof store.dispatch).toBe("function");
        });
        it("should return Obj with #state", function() {
            expect(store).toBeDefined();
            expect(store.state).toBe(initialState);
        });

        describe("store#dispatch", function() {

            it("should call reducer and preserve state on unknown action", function(){
                var action = {
                    type: "UNKNOWN",
                    payload: "some payload"
                };
                var oldState = store.state;
                store.dispatch(action);
                var newState = store.state;
                expect(reducerSpy).toHaveBeenCalledWith(oldState, action);
                expect(newState).toBe(oldState);
            });
            it("should call reducer and update state known action", function(){
                var action = {
                    type: "KNOWN"
                };
                var oldState = store.state;
                store.dispatch(action);
                var newState = store.state;
                expect(reducerSpy).toHaveBeenCalledWith(oldState, action);
                expect(newState.a).toBe("A");
            });
        });
    });

    it("should provide #combineReducers", function() {
        expect(ImmutableStore.combineReducers).toBeDefined();
        expect(typeof ImmutableStore.combineReducers).toBe("function");
    });

    describe("#combineReducers", function(){
        function reducerA(state, action) {
            return "aaa";
        }

        function reducerB(state, action) {
            return "bbb";
        }

        var combination = {
            a: reducerA,
            b: reducerB
        };

        var combinedReducer;

        beforeEach(function(){
            combinedReducer = ImmutableStore.combineReducers(combination);
            spyOn(combination, "a").and.callThrough();
            spyOn(combination, "b").and.callThrough();
        });

        it("should return reducer", function(){
            expect(typeof combinedReducer).toBe("function");
        });

        it("should call all reducers on call", function(){
            var state = {
                a: "A",
                b: "B"
            };
            var action = {};

            combinedReducer(state, action);
            expect(combination.a).toHaveBeenCalledWith(state.a, action);
            expect(combination.b).toHaveBeenCalledWith(state.b, action);
        });

        it("should update state per reducer", function(){
            var state = {};
            var action = {};

            var newState = combinedReducer(state, action);

            expect(newState.a).toBe("aaa");
            expect(newState.b).toBe("bbb");
        });

        it("should not update state if reducers did not change it", function(){
            var state = {};
            var action = {};

            var newState1 = combinedReducer(state, action);
            var newState2 = combinedReducer(newState1, action);

            expect(newState2).toBe(newState1);
        });

    });

    it("should provide #createSelector", function() {
        expect(typeof ImmutableStore.createSelector).toBe("function");
    });

    describe("#createSelector", function() {
        var newSelector;
        var inputA;
        beforeEach(function() {
            inputA = "a";
            var selectA = function(){
                return inputA;
            };
            var selectB = function(){
                return "b";
            };

            newSelector = ImmutableStore.createSelector([selectA, selectB], function(A,B){
                return {
                    ab: A+B
                };
            });
        });

        it("should return function", function() {
            expect(typeof newSelector).toBe("function");
        });

        it("result of selector should combine results from input selectors", function() {
            var val = newSelector();
            expect(val.ab).toBe("ab");
        });

        it("result of selector should update if inputs changed", function(){
            newSelector();
            inputA = "A";
            var val2 = newSelector();
            expect(val2.ab).toBe("Ab");
        });

        it("should memoize value", function() {
            var val1 = newSelector();
            var val2 = newSelector();
            expect(val2).toBe(val1);
        });

        it("should update value if input is changed", function() {
            var val1 = newSelector();
            inputA = "A";
            var val2 = newSelector();
            expect(val2).not.toBe(val1);
        });
    });
});

