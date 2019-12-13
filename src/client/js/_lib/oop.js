/*
* OOP v2.2.4 Copyright (c) 2019 AJ Savino
* https://github.com/koga73/OOP
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
var OOP = function(){
	var _instance = null;

	//For Node
	var _window = (typeof window !== typeof undefined) ? window : null;
	var _global = (typeof global !== typeof undefined) ? global : null;
	var _defaultObj = _window || _global || null;
	
	var _methods = {
		//Adds OOP methods to an obj (such as window/global by default)
		//Not required to be called. You can just use OOP without calling this
		changeScope:function(obj){
			obj = obj || _defaultObj;

			var tmp = {};
			_methods.extend(tmp, false, _instance);
			//We don't want to override properties on our object
			for (var prop in tmp){
				if (typeof obj[prop] !== typeof undefined){
					delete tmp[prop];
				}
			}
			_methods.extend(false, obj, tmp);

			return obj;
		},

		/* -=-=-=-=-= BEGIN CLASS =-=-=-=-=- */

		//Namespaces an object or function
		//Adds a _type property to the obj equal to the namespace
		//Start obj defaults to the window/global
		namespace:function(namespace, obj, startObj){
			var objs = namespace.split(".");
			var objsLen = objs.length;
			var node = startObj || _defaultObj;
			for (var i = 0; i < objsLen; i++){
				var objName = objs[i];
				if (i == objsLen - 1){
					var tmp = node[objName];
					if (typeof tmp !== typeof undefined){
						_methods.extend(false, obj, tmp);
					}
					node[objName] = obj;
				} else {
					node[objName] = node[objName] || {};
				}
				node[objName]._type = objs.slice(0, i + 1).join(".");
				node = node[objName];
			}
			return obj;
		},

		//Overwrites properties on obj with those of params
		//Adds a _type property to namespaced objects
		//Adds a _super property to the object
		//Adds an _interface property to the object
		//'Simple' param will prevent adding _type, _super, _interface
		createClass:function(instance, static, events, staticEvents, simple){
			static = static || null;
			events = events === true;
			staticEvents = staticEvents === true;
			simple = simple === true;

			var caller = null;
			if (arguments && arguments.callee && arguments.callee.caller){
				caller = arguments.callee.caller;
			}
			//Arguments can be passed in via objects. Any number of objects is supported
			var _class = function(){
				var _super = _class._super || null;
				if (_methods.isFunction(_super)){
					_super = _class._super.apply({}, arguments);
				}

				//To arrays
				var objArgs = [];
				var constructorArgs = [];
				var argsArr = Array.prototype.slice.call(arguments);
				var argsArrLen = argsArr.length;
				for (var i = 0; i < argsArrLen; i++){
					var arg = argsArr[i];
					if (_methods.isObject(arg)){
						objArgs.push(arg);
					} else {
						constructorArgs.push(arg);
					}
				}

				var _instance = instance;
				var _public = this;
				var _private = {};

				//Closure
				var isClosure = _methods.isFunction(_instance);
				if (isClosure){
					_instance = _instance(_private, _public); //Pass references, _private first because _public is essentially "this"
				}

				if (isClosure){
					//Extend super to instance
					_instance = _methods.extend({}, false, _super, true, _instance);
					//Extend public members to new object (public does not start with '_') and apply args
					_public = _methods.extend.apply(this, [_public, false, /^[^_]/, _instance].concat(objArgs));
					//Extend private members to new object (public starts with '_')
					_private = _methods.extend(_private, false, /^_/, _instance);
				} else {
					_public = _methods.extend.apply(this, [_public, false, _super, true, _instance, false].concat(objArgs));
				}

				if (!simple){
					_public._type = _class._type; //Copy type
					_public._super = _super;
					if (!simple && _super){
						_super._interface = _public;
					}
					_public._interface = _public; //So you don't need to create a var _this and for inheritance
				}

				//Events
				if (events){
					_methods.addEvents(_public);
				}

				//Constructor
				if (_public.__construct){
					_public.__construct.apply(this, constructorArgs);
				}
				if (_private.__construct){
					_private.__construct.apply(this, constructorArgs);
				}

				return _public;
			};
			if (static) {
				_methods.extend(_class, false, static);
				if (staticEvents){
					_methods.addEvents(_class);
				}
			}
			return _class;
		},

		construct:function(options){
			var instance = options.instance;
			var static = options.static;
			var events = options.events;
			var staticEvents = options.staticEvents;
			var simple = options.simple;
			return _methods.createClass(instance, static, events, staticEvents, simple);
		},

		//Adds super property on class object
		inherit:function(baseObj, extendingObj){
			if (typeof baseObj === typeof undefined){
				throw "base object is undefined";
			}
			if (!_methods.isFunction(baseObj)){
				throw "base object must be a function";
			}
			extendingObj._super = baseObj;

			return extendingObj;
		},

		/* -=-=-=-=-= END CLASS =-=-=-=-=- */



		/* -=-=-=-=-= BEGIN CORE =-=-=-=-=- */

		//Recursive clone
		//Pass in an object to be cloned
		//"deep" defaults to true for deep cloning
		clone:function(obj, deep){
			//Default to true
			if (typeof deep === typeof undefined){
				deep = true;
			} else {
				deep = deep === true;
			}
			switch (true){
				case (_methods.isObject(obj)):
					var clone = {};
					for (var prop in obj){
						var val = obj[prop];
						if (deep){
							//Prevent exceed call stack
							if (val !== obj){
								clone[prop] = _methods.clone(val, deep);
							} else {
								clone[prop] = val;
							}
						} else {
							clone[prop] = val;
						}
					}
					return clone;
				case (_methods.isArray(obj)):
					if (deep){
						var arr = [];
						var objLen = obj.length;
						for (var i = 0; i < objLen; i++){
							arr.push(_methods.clone(obj[i], deep));
						}
						return arr;
					} else {
						return obj.concat();
					}
			}
			return obj;
		},

		//Add subsequent object's properties onto object
		//Pass in an unlimited number of arguments
		//If you pass in a boolean it indicates the "deep" clone flag for subsequent arguments
		//{}
		//{}, {data:1}
		//{}, {data:{a:2}}
		//{}, {test:123}, {data:{a:2}}
		extend:function(){
			var argumentsLen = arguments.length;
			switch (argumentsLen){
				case 0:
					throw new Error("No arguments specified");
				case 1:
					return _methods.clone(arguments[0]);
				case 2:
				default:
					var deep = true; //Default
					var regex = null; //Default
					var obj = null;
					for (var i = 0; i < argumentsLen; i++){
						var arg = arguments[i];
						//Type check
						switch (true){
							case (_methods.isBoolean(arg)):
								deep = arg;
								break;
							case (_methods.isRegExp(arg)):
								regex = arg;
								break;
							default:
								if (!arg){
									continue;
								}
								//Set obj to first obj found
								if (!obj){
									obj = arg;
									continue;
								}
								for (var prop in arg){
									if (regex && !regex.test(prop)){
										continue;
									}
									if (deep){
										obj[prop] = _methods.clone(arg[prop], deep);
									} else {
										obj[prop] = arg[prop];
									}
								}
								break;
						}
					}
					return obj;
			}
		},

		/* -=-=-=-=-= END CORE =-=-=-=-=- */



		/* -=-=-=-=-= BEGIN TYPE CHECKS =-=-=-=-=- */

		isType:function(obj, type){
			type = type || null;
			if (!type){
				return obj._type;
			}

			var context = obj;
			do {
				if (context._type == type || context._type == type._type) {
					return true;
				}
				context = context._super;
			} while (typeof context !== typeof undefined);
			return false;
		},

		isFunction:function(obj){
			return obj && Object.prototype.toString.call(obj) == "[object Function]";
		},

		isArray:function(arr){
			return arr && Object.prototype.toString.call(arr) === "[object Array]";
		},

		isObject:function(obj){
			return obj && obj.constructor && obj.constructor.toString().indexOf("Object") > -1;
		},

		isString:function(str){
			return typeof str === typeof "";
		},

		isBoolean:function(bool){
			return bool === true || bool === false;
		},

		isRegExp:function(regex){
			return regex instanceof RegExp;
		},

		/* -=-=-=-=-= END TYPE CHECKS =-=-=-=-=- */



		/* -=-=-=-=-= BEGIN EVENTS =-=-=-=-=- */

		//Safe cross-browser event (use 'new OOP.Event()')
		event:function(type, data){
			var event = null;
			try { //IE catch
				event = new CustomEvent(type); //Non-IE
			} catch (ex){
				if (typeof document !== typeof undefined && document.createEventObject){ //IE
					event = document.createEventObject("Event");
					if (event.initCustomEvent){
						event.initCustomEvent(type, true, true);
					}
				} else { //Custom
					event = {};
				}
			}
			event.type = type;
			event.data = data;
			return event;
		},

		//Adds event system to object
		addEvents:function(obj, noAlias){
			noAlias = noAlias === true;
			if (!obj._eventHandlers){
				obj._eventHandlers = {};
			}
			if (!obj.addEventListener){
				obj.addEventListener = _methods._addEventListener;
				if (!noAlias){
					obj.on = _methods._addEventListener; //Alias
				}
			}
			if (!obj.removeEventListener){
				obj.removeEventListener = _methods._removeEventListener;
				if (!noAlias){
					obj.off = _methods._removeEventListener; //Alias
				}
			}
			if (!obj.dispatchEvent){
				obj.dispatchEvent = _methods._dispatchEvent;
				if (!noAlias){
					obj.trigger = _methods._dispatchEvent; //Alias
					obj.emit = _methods._dispatchEvent; //Alias
				}
			}
			return obj;
		},

		//Removes event system from object
		removeEvents:function(obj, noAlias){
			noAlias = noAlias === true;
			if (obj._eventHandlers){
				delete obj._eventHandlers;
			}
			if (obj.addEventListener){
				delete obj.addEventListener;
				if (!noAlias){
					delete obj.on; //Alias
				}
			}
			if (obj.removeEventListener){
				delete obj.removeEventListener;
				if (!noAlias){
					delete obj.off; //Alias
				}
			}
			if (obj.dispatchEvent){
				delete obj.dispatchEvent;
				if (!noAlias){
					delete obj.trigger; //Alias
					delete obj.emit; //Alias
				}
			}
			return obj;
		},

		//Safe cross-browser way to listen for one or more events
		//Pass obj, comma or whitespace delimeted event types, and a handler
		addEventListener:function(obj, types, handler){
			//For some reason IE8 in compatibility mode calls addEventListener
			if (_methods.isString(obj)){
				return;
			}
			if (!obj._eventHandlers){
				obj._eventHandlers = {};
			}
			types = types.split(/,|\s/);
			var typesLen = types.length;
			for (var i = 0; i < typesLen; i++){
				var type = types[i];
				if (obj.addEventListener){ //Standard
					handler = _methods._addEventHandler(obj, type, handler);
					obj.addEventListener(type, handler);
				} else if (obj.attachEvent){ //IE
					var attachHandler = function(){
						handler(_defaultObj.event);
					};
					attachHandler.handler = handler; //Store reference to original handler
					attachHandler = _methods._addEventHandler(obj, type, attachHandler);
					obj.attachEvent("on" + type, attachHandler);
				} else if (typeof jQuery !== typeof undefined){ //jQuery
					handler = _methods._addEventHandler(obj, type, handler);
					jQuery.on(type, handler);
				} else { //Custom
					obj.addEventListener = _methods._addEventListener;
					obj.addEventListener(type, handler);
				}
			}
		},

		//This is the custom method that gets added to objects
		_addEventListener:function(type, handler){
			handler._isCustom = true;
			_methods._addEventHandler(this, type, handler);
		},

		//Stores and returns handler reference
		_addEventHandler:function(obj, type, eventHandler){
			if (!obj._eventHandlers[type]){
				obj._eventHandlers[type] = [];
			}
			var eventHandlers = obj._eventHandlers[type];
			var eventHandlersLen = eventHandlers.length;
			for (var i = 0; i < eventHandlersLen; i++){
				if (eventHandlers[i] === eventHandler){
					return eventHandler;
				} else if (eventHandlers[i].handler && eventHandlers[i].handler === eventHandler){
					return eventHandlers[i];
				}
			}
			eventHandlers.push(eventHandler);
			return eventHandler;
		},

		//Safe cross-browser way to listen for one or more events
		//Pass obj, comma or whitespace delimeted event types, and optionally handler
		//If no handler is passed all handlers for each event type will be removed
		removeEventListener:function(obj, types, handler){
			//For some reason IE8 in compatibility mode calls addEventListener
			if (_methods.isString(obj)){
				return;
			}
			if (!obj._eventHandlers){
				obj._eventHandlers = {};
			}
			types = types.split(/,|\s/);
			var typesLen = types.length;
			for (var i = 0; i < typesLen; i++){
				var type = types[i];
				var handlers;
				if (typeof handler === typeof undefined){
					handlers = obj._eventHandlers[type] || [];
				} else {
					handlers = [handler];
				}
				var handlersLen = handlers.length;
				for (var j = 0; j < handlersLen; j++){
					var handler = handlers[j];
					if (obj.removeEventListener){ //Standard
						handler = _methods._removeEventHandler(obj, type, handler);
						obj.removeEventListener(type, handler);
					} else if (obj.detachEvent){ //IE
						handler = _methods._removeEventHandler(obj, type, handler);
						obj.detachEvent("on" + type, handler);
					} else if (typeof jQuery !== typeof undefined){ //jQuery
						handler = _methods._removeEventHandler(obj, type, handler);
						jQuery.off(type, handler);
					} else { //Custom
						obj.removeEventListener = _methods._removeEventListener;
						obj.removeEventListener(type, handler);
					}
				}
			}
		},

		//This is the custom method that gets added to objects
		//Pass comma or whitespace delimeted event types, and optionally handler
		//If no handler is passed all handlers for each event type will be removed
		_removeEventListener:function(types, handler){
			types = types.split(/,|\s/);
			var typesLen = types.length;
			for (var i = 0; i < typesLen; i++){
				var type = types[i];
				var handlers;
				if (typeof handler === typeof undefined){
					handlers = this._eventHandlers[type] || [];
				} else {
					handlers = [handler];
				}
				var handlersLen = handlers.length;
				for (var j = 0; j < handlersLen; j++){
					var handler = handlers[j];
					handler._isCustom = false;
					_methods._removeEventHandler(this, type, handler);
				}
			}
		},

		//Removes and returns handler reference
		_removeEventHandler:function(obj, type, eventHandler){
			if (!obj._eventHandlers[type]){
				obj._eventHandlers[type] = [];
			}
			var eventHandlers = obj._eventHandlers[type];
			var eventHandlersLen = eventHandlers.length;
			for (var i = 0; i < eventHandlersLen; i++){
				if (eventHandlers[i] === eventHandler){
					return eventHandlers.splice(i, 1)[0];
				} else if (eventHandlers[i].handler && eventHandlers[i].handler === eventHandler){
					return eventHandlers.splice(i, 1)[0];
				}
			}
		},

		//Safe cross-browser way to dispatch an event
		dispatchEvent:function(obj, event){
			if (!obj._eventHandlers){
				obj._eventHandlers = {};
			}
			if (obj.dispatchEvent){ //Standard
				obj.dispatchEvent(event);
			} else if (obj.fireEvent){ //IE
				obj.fireEvent("on" + type, event);
			} else if (typeof jQuery !== typeof undefined){
				jQuery(obj).trigger(jQuery.Event(event.type, {
					type:event.type,
					data:event.data
				}));
			} else { //Custom
				obj.dispatchEvent = _methods._dispatchEvent;
				obj.dispatchEvent(event);
			}
		},

		//This is the custom method that gets added to objects
		_dispatchEvent:function(event){
			_methods._dispatchEventHandlers(this, event);
		},

		//Dispatches an event to handler references
		_dispatchEventHandlers: function(obj, event){
			var eventHandlers = obj._eventHandlers[event.type];
			if (!eventHandlers){
				return;
			}
			var eventHandlersLen = eventHandlers.length;
			for (var i = 0; i < eventHandlersLen; i++){
				eventHandlers[i](event, event.data);
			}
		}

		/* -=-=-=-=-= END EVENTS =-=-=-=-=- */
	};

	//Public API
	_instance = {
		changeScope:_methods.changeScope,

		//Class
		namespace:_methods.namespace,
		inherit:_methods.inherit,
		createClass:_methods.createClass,
		construct:_methods.construct,

		//Core
		clone:_methods.clone,
		extend:_methods.extend,

		//Type checks
		isType:_methods.isType,
		isFunction:_methods.isFunction,
		isArray:_methods.isArray,
		isObject:_methods.isObject,
		isString:_methods.isString,
		isBoolean:_methods.isBoolean,
		isRegExp:_methods.isRegExp,

		//Events
		Event:_methods.event,

		addEvents:_methods.addEvents,
		removeEvents:_methods.removeEvents,

		addEventListener:_methods.addEventListener,
		on:_methods.addEventListener, //Alias

		removeEventListener:_methods.removeEventListener,
		off:_methods.removeEventListener, //Alias

		dispatchEvent:_methods.dispatchEvent,
		trigger:_methods.dispatchEvent, //Alias
		emit:_methods.dispatchEvent //Alias
	};
	return _instance;
}();
//TODO: There is probably a better way of doing this
if (typeof module !== typeof undefined){
	module.exports = OOP;
}