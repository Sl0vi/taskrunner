(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./taskrunner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var taskrunner_1 = require("./taskrunner");
    test('TaskRunner can run and complete basic tasks', function () {
        var runStartCount = 0;
        var runStartCallback = function (taskName) {
            runStartCount++;
        };
        var runEndCount = 0;
        var runEndCallback = function (taskName) {
            runEndCount++;
        };
        var taskInitCount = 0;
        var taskInitCallback = function (task) {
            taskInitCount++;
        };
        var taskStartCount = 0;
        var taskStartCallback = function (task) {
            taskStartCount++;
        };
        var taskEndCount = 0;
        var taskEndCallback = function (task) {
            taskEndCount++;
        };
        var task1Count = 0;
        var task1 = function () {
            task1Count++;
        };
        var task2Count = 0;
        var task2 = function () {
            task2Count++;
        };
        var taskRunner = new taskrunner_1.default();
        taskRunner.runStart(runStartCallback);
        taskRunner.runEnd(runEndCallback);
        taskRunner.taskInitialize(taskInitCallback);
        taskRunner.taskStart(taskStartCallback);
        taskRunner.taskEnd(taskEndCallback);
        taskRunner.task('task1', task1);
        taskRunner.task('task2', 'task1', task2);
        taskRunner.run('task2');
        expect(runStartCount).toEqual(1);
        expect(runEndCount).toEqual(1);
        expect(taskInitCount).toEqual(2);
        expect(taskStartCount).toEqual(2);
        expect(taskEndCount).toEqual(2);
        expect(task1Count).toEqual(1);
        expect(task2Count).toEqual(1);
    });
    test('Tasks are run only once even with multiple dependents', function () {
        var runStartCount = 0;
        var runStartCallback = function (taskName) {
            runStartCount++;
        };
        var runEndCount = 0;
        var runEndCallback = function (taskName) {
            runEndCount++;
        };
        var taskInitCount = 0;
        var taskInitCallback = function (task) {
            taskInitCount++;
        };
        var taskStartCount = 0;
        var taskStartCallback = function (task) {
            taskStartCount++;
        };
        var taskEndCount = 0;
        var taskEndCallback = function (task) {
            taskEndCount++;
        };
        var task1Count = 0;
        var task1 = function () {
            task1Count++;
        };
        var task2Count = 0;
        var task2 = function () {
            task2Count++;
        };
        var task3Count = 0;
        var task3 = function () {
            task3Count++;
        };
        var task4Count = 0;
        var task4 = function () {
            task4Count++;
        };
        var taskRunner = new taskrunner_1.default();
        taskRunner.runStart(runStartCallback);
        taskRunner.runEnd(runEndCallback);
        taskRunner.taskInitialize(taskInitCallback);
        taskRunner.taskStart(taskStartCallback);
        taskRunner.taskEnd(taskEndCallback);
        taskRunner.task('task1', task1);
        taskRunner.task('task2', 'task1', task2);
        taskRunner.task('task3', 'task1', task3);
        taskRunner.task('task4', ['task2', 'task3'], task4);
        taskRunner.run('task4');
        expect(runStartCount).toEqual(1);
        expect(runEndCount).toEqual(1);
        expect(taskInitCount).toEqual(4);
        expect(taskStartCount).toEqual(4);
        expect(taskEndCount).toEqual(4);
        expect(task1Count).toEqual(1);
        expect(task2Count).toEqual(1);
        expect(task3Count).toEqual(1);
        expect(task4Count).toEqual(1);
    });
    test('TaskRunner runs default task if no taskname is specified', function () {
        var runStartCount = 0;
        var runStartCallback = function (taskName) {
            runStartCount++;
        };
        var runEndCount = 0;
        var runEndCallback = function (taskName) {
            runEndCount++;
        };
        var taskInitCount = 0;
        var taskInitCallback = function (task) {
            taskInitCount++;
        };
        var taskStartCount = 0;
        var taskStartCallback = function (task) {
            taskStartCount++;
        };
        var taskEndCount = 0;
        var taskEndCallback = function (task) {
            taskEndCount++;
        };
        var task1Count = 0;
        var task1 = function () {
            task1Count++;
        };
        var task2Count = 0;
        var task2 = function () {
            task2Count++;
        };
        var task3Count = 0;
        var task3 = function () {
            task3Count++;
        };
        var task4Count = 0;
        var task4 = function () {
            task4Count++;
        };
        var taskRunner = new taskrunner_1.default();
        taskRunner.runStart(runStartCallback);
        taskRunner.runEnd(runEndCallback);
        taskRunner.taskInitialize(taskInitCallback);
        taskRunner.taskStart(taskStartCallback);
        taskRunner.taskEnd(taskEndCallback);
        taskRunner.task('task1', task1);
        taskRunner.task('task2', 'task1', task2);
        taskRunner.task('task3', 'task1', task3);
        taskRunner.task('default', ['task2', 'task3'], task4);
        taskRunner.run();
        expect(runStartCount).toEqual(1);
        expect(runEndCount).toEqual(1);
        expect(taskInitCount).toEqual(4);
        expect(taskStartCount).toEqual(4);
        expect(taskEndCount).toEqual(4);
        expect(task1Count).toEqual(1);
        expect(task2Count).toEqual(1);
        expect(task3Count).toEqual(1);
        expect(task4Count).toEqual(1);
    });
    test('Duplicate task names should throw an error', function () {
        var taskRunner = new taskrunner_1.default();
        taskRunner.task('task1', function () { });
        expect(function () { return taskRunner.task('task1', function () { }); }).toThrow();
    });
    test('Cyclic dependencies throw an error', function () {
        var taskRunner = new taskrunner_1.default();
        taskRunner.task('task1', 'task2', function () { });
        taskRunner.task('task2', 'task1', function () { });
        expect(function () { return taskRunner.run('task2'); }).toThrow();
    });
    test('Task with no handler still executes dependencies', function () {
        var taskRunner = new taskrunner_1.default();
        var task1Count = 0;
        taskRunner.task('task1', function () { return task1Count++; });
        taskRunner.task('task2', 'task1');
        taskRunner.run('task2');
        expect(task1Count).toEqual(1);
    });
});
//# sourceMappingURL=taskrunner.test.js.map