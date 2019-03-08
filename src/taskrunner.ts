/**
 * A task can be run by the task runner.
 */
export interface Task {
  name: string;
  dependencies: Array<string>;
  handler: (() => void) | null;
  hasRun: boolean;
}

/**
 * The value passed to callback functions in task hooks.
 */
export interface TaskHook {
  taskName: string;
  dependencies: Array<string>;
}

/**
 * An error with registering or running tasks.
 */
export interface TaskError {
  taskName: string;
  errorMessage: string;
}

/**
 * Checks if all the items in the array are strings.
 * 
 * @param   {Array<any>} array The array to check.
 * @returns {boolean}          True if all items in the array are strings, false
 *                             otherwise.
 */
function arrayOnlyContainsStrings(array: Array<any>): boolean {
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
function isSet(value: any): boolean {
  return typeof value !== 'undefined' && value !== null;
}

/**
 * A simple task runner that just runs standard javascript functions.
 */
export default class TaskRunner {
  private tasks: { [name: string]: Task } = {};
  private runStartHooks: Array<((taskName: string) => void)> = [];
  private runEndHooks: Array<(taskName: string) => void> = [];
  private taskInitializeHooks: Array<(task: TaskHook) => void> = [];
  private taskStartHooks: Array<(task: TaskHook) => void> = [];
  private taskEndHooks: Array<(task: TaskHook) => void> = [];

  /**
   * Initializes a new instance of the tasker runner.
   */
  constructor() {
  }

  runStart(callback: (taskName: string) => void): void {
    this.runStartHooks.push(callback);
  }

  runEnd(callback: (taskName: string) => void): void {
    this.runEndHooks.push(callback);
  }

  taskInitialize(callback: (task: TaskHook) => void): void {
    this.taskInitializeHooks.push(callback);
  }

  taskStart(callback: (task: TaskHook) => void): void {
    this.taskStartHooks.push(callback);
  }

  taskEnd(callback: (task: TaskHook) => void): void {
    this.taskEndHooks.push(callback);
  }

  /**
   * Registers a task with the task runner.
   * 
   * @param name 
   * @param handler 
   */
  task(name: string, handler: () => void): void;

  /**
   * Registers a task with the task runner.
   * 
   * @param name 
   * @param dependencies 
   */
  task(name: string, dependencies: Array<string> | string): void;

  /**
   * Registers a task with the task runner.
   * 
   * @param name 
   * @param dependencies 
   * @param handler 
   */
  task(
    name: string,
    dependencies: Array<string> | string,
    handler: () => void): void;

  /**
   * Registers a task with the task runner.
   * 
   * @param name 
   */
  task(name: string, b: Array<string> | string | (() => void)): void {
    if (isSet(this.tasks[name])) {
      let error: TaskError = {
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
      let dependencies: Array<string>;
      if (typeof arguments[1] === 'string') {
        dependencies = [arguments[1]];
      }
      else if (Array.isArray(arguments[1])) {
        if (!arrayOnlyContainsStrings(arguments[1])) {
          let error: TaskError = {
            taskName: name,
            errorMessage: 'Dependencies must all be strings'
          };
          throw error;
        }
        dependencies = arguments[1];
      }
      else {
        let error: TaskError = {
          taskName: name,
          errorMessage:
            'Parameter dependencies invalid. ' +
            'It must be a string or an array of strings'
        };
        throw error;
      }
      if (typeof arguments[2] !== 'function') {
        let error: TaskError = {
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
      let error: TaskError = {
        taskName: name,
        errorMessage:
          'You must either pass in some dependencies, a handler ' +
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
  run(taskName: string = 'default'): void {
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
  private processTasks(taskName: string, stack: Array<string>): void {
    let task = this.tasks[taskName];
    if (!isSet(task)) {
      let error: TaskError = {
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
          let error: TaskError = {
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
