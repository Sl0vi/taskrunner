(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Checks if all the items in the array are strings.
     *
     * @param   {Array<any>} array The array to check.
     * @returns {boolean}          True if all items in the array are strings, false
     *                             otherwise.
     */
    function arrayOnlyContainsStrings(array) {
        for (var i = 0; i < array.length; i++) {
            if (typeof array[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if the value is not null or undefined.
     *
     * @param   {any}     value The value that should checked.
     * @returns {boolean}       False if the value is either null or undefined, true
     *                          otherwise.
     */
    function isSet(value) {
        return typeof value !== 'undefined' && value !== null;
    }
    /**
     * A simple task runner that just runs standard javascript functions.
     */
    var TaskRunner = /** @class */ (function () {
        /**
         * Initializes a new instance of the tasker runner.
         */
        function TaskRunner() {
            this.tasks = {};
            this.runStartHooks = [];
            this.runEndHooks = [];
            this.taskInitializeHooks = [];
            this.taskStartHooks = [];
            this.taskEndHooks = [];
        }
        TaskRunner.prototype.runStart = function (callback) {
            this.runStartHooks.push(callback);
        };
        TaskRunner.prototype.runEnd = function (callback) {
            this.runEndHooks.push(callback);
        };
        TaskRunner.prototype.taskInitialize = function (callback) {
            this.taskInitializeHooks.push(callback);
        };
        TaskRunner.prototype.taskStart = function (callback) {
            this.taskStartHooks.push(callback);
        };
        TaskRunner.prototype.taskEnd = function (callback) {
            this.taskEndHooks.push(callback);
        };
        /**
         * Registers a task with the task runner.
         *
         * @param name
         */
        TaskRunner.prototype.task = function (name, b) {
            if (isSet(this.tasks[name])) {
                var error = {
                    taskName: name,
                    errorMessage: "A task named " + name + " already exists."
                };
                throw error;
            }
            if (arguments.length === 2 && typeof arguments[1] === 'function') {
                this.tasks[name] = {
                    name: name,
                    dependencies: [],
                    handler: arguments[1],
                    hasRun: false
                };
            }
            else if (arguments.length === 2 && typeof arguments[1] === 'string') {
                this.tasks[name] = {
                    name: name,
                    dependencies: [arguments[1]],
                    handler: null,
                    hasRun: false
                };
            }
            else if (arguments.length === 2 && Array.isArray(arguments[1])) {
                if (!arrayOnlyContainsStrings(arguments[1])) {
                    var error = {
                        taskName: name,
                        errorMessage: 'Dependencies must all be strings'
                    };
                    throw error;
                }
                this.tasks[name] = {
                    name: name,
                    dependencies: arguments[1],
                    handler: null,
                    hasRun: false
                };
            }
            else if (arguments.length === 3) {
                var dependencies = void 0;
                if (typeof arguments[1] === 'string') {
                    dependencies = [arguments[1]];
                }
                else if (Array.isArray(arguments[1])) {
                    if (!arrayOnlyContainsStrings(arguments[1])) {
                        var error = {
                            taskName: name,
                            errorMessage: 'Dependencies must all be strings'
                        };
                        throw error;
                    }
                    dependencies = arguments[1];
                }
                else {
                    var error = {
                        taskName: name,
                        errorMessage: 'Parameter dependencies invalid. ' +
                            'It must be a string or an array of strings'
                    };
                    throw error;
                }
                if (typeof arguments[2] !== 'function') {
                    var error = {
                        taskName: name,
                        errorMessage: 'The task handler must be a function'
                    };
                    throw error;
                }
                this.tasks[name] = {
                    name: name,
                    dependencies: dependencies,
                    handler: arguments[2],
                    hasRun: false
                };
            }
            else {
                var error = {
                    taskName: name,
                    errorMessage: 'You must either pass in some dependencies, a handler ' +
                        'function or both.'
                };
                throw error;
            }
        };
        /**
         * Runs the specified task or the 'default' task if no task is specified.
         *
         * @param taskName
         */
        TaskRunner.prototype.run = function (taskName) {
            if (taskName === void 0) { taskName = 'default'; }
            for (var i = 0; i < this.runStartHooks.length; i++) {
                this.runStartHooks[i](taskName);
            }
            this.processTasks(taskName, []);
            for (var i = 0; i < this.runEndHooks.length; i++) {
                this.runEndHooks[i](taskName);
            }
        };
        /**
         * Takes care of the process of running a task and all of its dependencies.
         *
         * @param taskName
         * @param stack
         */
        TaskRunner.prototype.processTasks = function (taskName, stack) {
            var task = this.tasks[taskName];
            if (!isSet(task)) {
                var error = {
                    taskName: taskName,
                    errorMessage: taskName + " not found."
                };
                throw error;
            }
            if (task.hasRun) {
                return;
            }
            for (var i = 0; i < this.taskInitializeHooks.length; i++) {
                this.taskInitializeHooks[i]({
                    taskName: task.name,
                    dependencies: task.dependencies.slice()
                });
            }
            task.hasRun = true;
            for (var i = 0; i < task.dependencies.length; i++) {
                for (var x = 0; x < stack.length; x++) {
                    if (task.dependencies[i] === stack[x]) {
                        var error = {
                            taskName: taskName,
                            errorMessage: 'Circular dependency detected. Aborting.'
                        };
                        throw error;
                    }
                }
                var newStack = stack.slice();
                newStack.push(taskName);
                this.processTasks(task.dependencies[i], newStack);
            }
            for (var i = 0; i < this.taskStartHooks.length; i++) {
                this.taskStartHooks[i]({
                    taskName: task.name,
                    dependencies: task.dependencies.slice()
                });
            }
            if (task.handler !== null) {
                task.handler();
            }
            for (var i = 0; i < this.taskEndHooks.length; i++) {
                this.taskEndHooks[i]({
                    taskName: task.name,
                    dependencies: task.dependencies.slice()
                });
            }
        };
        return TaskRunner;
    }());
    exports.default = TaskRunner;
});
//# sourceMappingURL=taskrunner.js.map