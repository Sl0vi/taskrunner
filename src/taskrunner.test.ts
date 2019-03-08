import TaskRunner, { TaskHook } from './taskrunner';

test('TaskRunner can run and complete basic tasks', () => {
  let runStartCount = 0;
  let runStartCallback = (taskName: string) => {
    runStartCount++;
  }
  let runEndCount = 0;
  let runEndCallback = (taskName: string) => {
    runEndCount++;
  }
  let taskInitCount = 0;
  let taskInitCallback = (task: TaskHook) => {
    taskInitCount++;
  }
  let taskStartCount = 0;
  let taskStartCallback = (task: TaskHook) => {
    taskStartCount++;
  }
  let taskEndCount = 0;
  let taskEndCallback = (task: TaskHook) => {
    taskEndCount++;
  }
  let task1Count = 0;
  let task1 = () => {
    task1Count++;
  }
  let task2Count = 0;
  let task2 = () => {
    task2Count++;
  }

  const taskRunner = new TaskRunner();
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

test('Tasks are run only once even with multiple dependents', () => {
  let runStartCount = 0;
  const runStartCallback = (taskName: string) => {
    runStartCount++;
  }
  let runEndCount = 0;
  const runEndCallback = (taskName: string) => {
    runEndCount++;
  }
  let taskInitCount = 0;
  const taskInitCallback = (task: TaskHook) => {
    taskInitCount++;
  }
  let taskStartCount = 0;
  const taskStartCallback = (task: TaskHook) => {
    taskStartCount++;
  }
  let taskEndCount = 0;
  const taskEndCallback = (task: TaskHook) => {
    taskEndCount++;
  }
  let task1Count = 0;
  const task1 = () => {
    task1Count++;
  }
  let task2Count = 0;
  const task2 = () => {
    task2Count++;
  }
  let task3Count = 0;
  const task3 = () => {
    task3Count++;
  }
  let task4Count = 0;
  const task4 = () => {
    task4Count++;
  }

  const taskRunner = new TaskRunner();
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

test('TaskRunner runs default task if no taskname is specified', () => {
  let runStartCount = 0;
  const runStartCallback = (taskName: string) => {
    runStartCount++;
  }
  let runEndCount = 0;
  const runEndCallback = (taskName: string) => {
    runEndCount++;
  }
  let taskInitCount = 0;
  const taskInitCallback = (task: TaskHook) => {
    taskInitCount++;
  }
  let taskStartCount = 0;
  const taskStartCallback = (task: TaskHook) => {
    taskStartCount++;
  }
  let taskEndCount = 0;
  const taskEndCallback = (task: TaskHook) => {
    taskEndCount++;
  }
  let task1Count = 0;
  const task1 = () => {
    task1Count++;
  }
  let task2Count = 0;
  const task2 = () => {
    task2Count++;
  }
  let task3Count = 0;
  const task3 = () => {
    task3Count++;
  }
  let task4Count = 0;
  const task4 = () => {
    task4Count++;
  }

  const taskRunner = new TaskRunner();
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

test('Duplicate task names should throw an error', () => {
  const taskRunner = new TaskRunner();
  taskRunner.task('task1', () => { });
  expect(() => taskRunner.task('task1', () => { })).toThrow();
});

test('Cyclic dependencies throw an error', () => {
  const taskRunner = new TaskRunner();
  taskRunner.task('task1', 'task2', () => { });
  taskRunner.task('task2', 'task1', () => { });
  expect(() => taskRunner.run('task2')).toThrow();
});

test('Task with no handler still executes dependencies', () => {
  const taskRunner = new TaskRunner();
  let task1Count = 0;
  taskRunner.task('task1', () => task1Count++);
  taskRunner.task('task2', 'task1');
  taskRunner.run('task2');
  expect(task1Count).toEqual(1);
});
