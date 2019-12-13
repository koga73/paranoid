const gulp = require("gulp");
const sass = require("gulp-sass");
const runSequence = require("run-sequence");
const del = require("del");
const createTask = require("./gulp/create-task");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sourcemaps = require('gulp-sourcemaps');

const src = "src/";
const dst = "www/";

const config = {
	static:{
		name:"static",
		files:{
			input:[
				src + "client/*.html",
				src + "client/**/vue.js",
				src + "client/**/vue.min.js"
			],
			output:dst
		}
	},
	js:{
		name:"js",
		files:{
			input:[
				src + "client/js/_lib/promise-polyfill.js",
				src + "client/js/_lib/oop.js",
				src + "client/js/_lib/axios.js",
				src + "client/js/page.js",
			],
			output:dst + "js/"
		}
	},
	sass:{
		name:"sass",
		files:{
			input:src + "client/scss/*.scss",
			output:dst + "css/"
		}
	}
};

//copy
//copy:static
function copy(config){
	gulp.src(config.files.input).pipe(gulp.dest(config.files.output));
}
createTask("copy", copy, [config.static]);

//sass
function compileSass(config){
	gulp.src(config.files.input)
		.pipe(sass({
			outputStyle:"compressed"
		}).on("error", function(ex){
		   console.log(ex);
		}))
		.pipe(gulp.dest(config.files.output));
}
createTask("sass", compileSass, [config.sass]);

//js
function bundleJS(config){
	gulp.src(config.files.input)
		.pipe(sourcemaps.init())
		.pipe(concat("site.js"))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(config.files.output));
}
createTask("js", bundleJS, [config.js]);

//clean
//clean:static
//clean:js
//clean:sass
function clean(config){
	return del([config.files.output]);
}
createTask("clean", clean, [config.static, config.js, config.sass]);

//build
//build:static
//build:js
//build:sass
function build(buildConfig){
	switch (buildConfig.name){
		case config.static.name:
			copy(buildConfig);
			break;
		case config.js.name:
			bundleJS(buildConfig);
			break;
		case config.sass.name:
			compileSass(buildConfig);
			break;
	}
}
createTask("build", build, [config.static, config.js, config.sass]);

//watch
//watch:static
//watch:js
//watch:sass
function watch(config){
	return gulp.watch(config.files.input, ["build:" + config.name]);
}
createTask("watch", watch, [config.static, config.js, config.sass]);

gulp.task("default", ["build"]);