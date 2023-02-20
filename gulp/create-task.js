const gulp = require("gulp");
const runSequence = require("gulp4-run-sequence");

//Creates a task with colon-delimeted subtasks
//taskName is the root. Ex. "sass"
//Calling the root task will execute all subtasks
//subTasks is an array of config objects each containing a "name"
//subTasks are generated as such: "sass:foo", "sass:bar"
module.exports = function(taskName, method, subTasksConfigs){
	var sequence = [];
	if (subTasksConfigs){
		subTasksConfigs.forEach(subTaskConfig => {
			var subTaskName = taskName + ":" + subTaskConfig.name;
			sequence.push(subTaskName);
			gulp.task(subTaskName, gulp.series(async () => {
				return method(subTaskConfig);
			}));
		});
	}
	gulp.task(taskName, gulp.series((callback) => {
		var args = sequence.concat(); //Copy
		args.push(callback);
		runSequence.apply(this, args);
	}));
};