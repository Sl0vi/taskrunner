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
 * A simple task runner that just runs standard javascript functions.
 */
export default class TaskRunner {
    private tasks;
    private runStartHooks;
    private runEndHooks;
    private taskInitializeHooks;
    private taskStartHooks;
    private taskEndHooks;
    /**
     * Initializes a new instance of the tasker runner.
     */
    constructor();
    runStart(callback: (taskName: string) => void): void;
    runEnd(callback: (taskName: string) => void): void;
    taskInitialize(callback: (task: TaskHook) => void): void;
    taskStart(callback: (task: TaskHook) => void): void;
    taskEnd(callback: (task: TaskHook) => void): void;
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
    task(name: string, dependencies: Array<string> | string, handler: () => void): void;
    /**
     * Runs the specified task or the 'default' task if no task is specified.
     *
     * @param taskName
     */
    run(taskName?: string): void;
    /**
     * Takes care of the process of running a task and all of its dependencies.
     *
     * @param taskName
     * @param stack
     */
    private processTasks;
}
