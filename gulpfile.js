const gulp = require("gulp");
const sass = require("gulp-sass");
const runSequence = require("run-sequence");
const del = require("del");
const createTask = require("./gulp/create-task");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const inlinesource = require("gulp-inline-source");
const rename = require("gulp-rename");

const src = "src/";
const dst = "www/";

const config = {
	static:{
		name:"static",
		files:{
			input:[
				src + "client/*.html",
				src + "client/**/vue.js",
				src + "client/**/vue.min.js",
				src + "shared/**/cipher-plugins/*.js",
			],
			output:dst
		}
	},
	jsLib:{
		name:"js-lib",
		files:{
			input:[
				src + "client/js/_lib/promise-polyfill.js",
				src + "client/js/_lib/vue.js",
				src + "client/js/_lib/axios.js",
				src + "client/js/_lib/oop.js",
			],
			output:dst + "js/"
		}
	},
	js:{
		name:"js",
		files:{
			input:[
				src + "client/js/polyfill/random.js",
				src + "shared/js/polyfill/string.js",
				src + "client/js/global/error-handler.js",
				src + "client/js/helpers/helpers.js",
				src + "client/js/helpers/crypto.js",
				src + "client/js/resources/regex.js",
				src + "client/js/services/storage.js",
				src + "client/js/events/sync.js",
				src + "client/js/models/cipher.js",
				src + "client/js/models/relay.js",
				src + "client/js/models/account.js",
				src + "client/js/models/room.js",
				src + "client/js/models/socket-metadata.js",
				src + "shared/js/models/protocol.js",
				src + "client/js/socket-handlers/on-message.js",
				src + "client/js/socket-handlers/send.js",
				src + "client/js/components/preferences.js",
				src + "client/js/components/relays.js",
				src + "client/js/components/accounts.js",
				src + "client/js/components/message.js",
				src + "client/js/components/chat.js",
				src + "client/js/page.js"
			],
			output:dst + "js/"
		}
	},
	sass:{
		name:"sass",
		files:{
			input:src + "client/scss/**/*.scss",
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

//js-lib
function bundleJSLib(config){
	gulp.src(config.files.input)
		.pipe(sourcemaps.init())
		.pipe(concat("lib.js"))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(config.files.output));
}
createTask("js-lib", bundleJSLib, [config.jsLib]);

//clean
//clean:static
//clean:js
//clean:js-lib
//clean:sass
function clean(config){
	return del([config.files.output]);
}
createTask("clean", clean, [config.static, config.js, config.sass]);

//build
//build:static
//build:js
//build:js-lib
//build:sass
function build(buildConfig){
	switch (buildConfig.name){
		case config.static.name:
			copy(buildConfig);
			break;
		case config.js.name:
			bundleJS(buildConfig);
			break;
		case config.jsLib.name:
			bundleJSLib(buildConfig);
			break;
		case config.sass.name:
			compileSass(buildConfig);
			break;
	}
}
createTask("build", build, [config.static, config.js, config.jsLib, config.sass]);

//watch
//watch:static
//watch:js
//watch:js-lib
//watch:sass
function watch(config){
	return gulp.watch(config.files.input, ["build:" + config.name]);
}
createTask("watch", watch, [config.static, config.js, config.jsLib, config.sass]);

//portable
gulp.task("portable", function(){
	return gulp
		.src(dst + "index.html")
		.pipe(inlinesource({
			attribute:false,
			rootpath:dst
		}))
		.pipe(rename("paranoid-portable.html"))
		.pipe(gulp.dest(dst));
});

gulp.task("default", ["build"]);