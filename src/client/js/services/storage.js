(function(){
    var _consts = {
        _RELAYS:{
            key:"relays",
            version:1,
            ttl:7 * 24 * 60 * 60 * 1000 //ms - 1 week
        }
    };

    var _vars = {
        _localStorageSupported:null,
        _memStorage:{}
    };

    OOP.namespace("Services.Storage",
    OOP.construct({

        static:{
            saveRelays:function(relays){
                _methods._saveData(_consts._RELAYS, relays);
            },
            loadRelays:function(){
                return _methods._loadData(_consts._RELAYS);
            },
            clearRelays:function(){
                _methods._clearKey(_consts._RELAYS.key);
            }
        }
        
    }));

    var _methods = {
        _saveData:function(definition, data){
            _methods._setObject(definition.key, {
			    version:definition.version,
			    timeStamp:new Date().getTime(),
			    data:data
		    });
        },
        _loadData:function(definition){
            var data = _methods._getObject(definition.key);
            if (!data){
                return null;
            }
            if (data.version != definition.version){
                return null;
            }
            if (definition.ttl){
                var now = new Date().getTime();
                var timeElapsed = now - data.timeStamp;
                if (timeElapsed >= definition.ttl){
                    console.warn(definition.key + " ttl expired");
                    _methods._clearKey(definition.key);
                    return null;
                }
            }
            return data.data;
        },

        //localStorage is not supported in safari private mode if Safari < 10
	    _isSupported:function(){
		    if (_vars._localStorageSupported == null){
			    try {
				    window.localStorage["__storage_test__"] = "";
				    window.localStorage.removeItem("__storage_test__");
				    _vars._localStorageSupported = true;
			    } catch (error){
				    _vars._localStorageSupported = false;
			    }
		    }
		    return _vars._localStorageSupported;
	    },
        _set:function(key, value){
		    if (_methods._isSupported()){
			    window.localStorage[key] = value;
		    } else {
			    _vars._memStorage[key] = value;
		    }
        },
        _get:function(key){
            if (_methods._isSupported()){
			    return window.localStorage[key] || null;
            } else {
			    return _vars._memStorage[key] || null;
            }
        },
        _setObject:function(key, value){
		    if (_methods._isSupported()){
			    window.localStorage[key] = JSON.stringify(value);
		    } else {
			    _vars._memStorage[key] = JSON.stringify(value);
		    }
        },
        _getObject:function(key){
		    if (_methods._isSupported()){
			    return JSON.parse(window.localStorage[key] || null);
		    } else {
			    return JSON.parse(_vars._memStorage[key] || null);
		    }
        },
	    _clearKey:function(key){
		    if (_methods._isSupported()){
			    window.localStorage.removeItem(key);
		    } else {
			    delete _vars._memStorage[key];
		    }
	    }
    }
})();