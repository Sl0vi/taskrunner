/**
 * Checks if all the items in the array are strings.
 *
 * @param   {Array<any>} array The array to check.
 * @returns {boolean}          True if all items in the array are strings, false
 *                             otherwise.
 */
function arrayOnlyContainsStrings(array) {
    for (let i = 0; i < array.length; i++) {
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
export default class TaskRunner {
    /**
     * Initializes a new instance of the tasker runner.
     */
    constructor() {
        this.tasks = {};
        this.runStartHooks = [];
        this.runEndHooks = [];
        this.taskInitializeHooks = [];
        this.taskStartHooks = [];
        this.taskEndHooks = [];
    }
    runStart(callback) {
        this.runStartHooks.push(callback);
    }
    runEnd(callback) {
        this.runEndHooks.push(callback);
    }
    taskInitialize(callback) {
        this.taskInitializeHooks.push(callback);
    }
    taskStart(callback) {
        this.taskStartHooks.push(callback);
    }
    taskEnd(callback) {
        this.taskEndHooks.push(callback);
    }
    /**
     * Registers a task with the task runner.
     *
     * @param name
     */
    task(name, b) {
        if (isSet(this.tasks[name])) {
            let error = {
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
                let error = {
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
            let dependencies;
            if (typeof arguments[1] === 'string') {
                dependencies = [arguments[1]];
            }
            else if (Array.isArray(arguments[1])) {
                if (!arrayOnlyContainsStrings(arguments[1])) {
                    let error = {
                        taskName: name,
                        errorMessage: 'Dependencies must all be strings'
                    };
                    throw error;
                }
                dependencies = arguments[1];
            }
            else {
                let error = {
                    taskName: name,
                    errorMessage: 'Parameter dependencies invalid. ' +
                        'It must be a string or an array of strings'
                };
                throw error;
            }
            if (typeof arguments[2] !== 'function') {
                let error = {
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
            let error = {
                taskName: name,
                errorMessage: 'You must either pass in some dependencies, a handler ' +
                    'function or both.'
            };
            throw error;
        }
    }
    /**
     * Runs the specified task or the 'default' task if no task is specified.
     *
     * @param taskName
     */
    run(taskName = 'default') {
        for (let i = 0; i < this.runStartHooks.length; i++) {
            this.runStartHooks[i](taskName);
        }
        this.processTasks(taskName, []);
        for (let i = 0; i < this.runEndHooks.length; i++) {
            this.runEndHooks[i](taskName);
        }
    }
    /**
     * Takes care of the process of running a task and all of its dependencies.
     *
     * @param taskName
     * @param stack
     */
    processTasks(taskName, stack) {
        let task = this.tasks[taskName];
        if (!isSet(task)) {
            let error = {
                taskName: taskName,
                errorMessage: `${taskName} not found.`
            };
            throw error;
        }
        if (task.hasRun) {
            return;
        }
        for (let i = 0; i < this.taskInitializeHooks.length; i++) {
            this.taskInitializeHooks[i]({
                taskName: task.name,
                dependencies: task.dependencies.slice()
            });
        }
        task.hasRun = true;
        for (let i = 0; i < task.dependencies.length; i++) {
            for (let x = 0; x < stack.length; x++) {
                if (task.dependencies[i] === stack[x]) {
                    let error = {
                        taskName: taskName,
                        errorMessage: 'Circular dependency detected. Aborting.'
                    };
                    throw error;
                }
            }
            let newStack = stack.slice();
            newStack.push(taskName);
            this.processTasks(task.dependencies[i], newStack);
        }
        for (let i = 0; i < this.taskStartHooks.length; i++) {
            this.taskStartHooks[i]({
                taskName: task.name,
                dependencies: task.dependencies.slice()
            });
        }
        if (task.handler !== null) {
            task.handler();
        }
        for (let i = 0; i < this.taskEndHooks.length; i++) {
            this.taskEndHooks[i]({
                taskName: task.name,
                dependencies: task.dependencies.slice()
            });
        }
    }
}
//# sourceMappingURL=taskrunner.js.map