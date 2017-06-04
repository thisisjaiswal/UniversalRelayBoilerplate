Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};

var _dataloader=require("dataloader");var _dataloader2=_interopRequireDefault(_dataloader);
var _graphqlRelay=require("graphql-relay");

var _AnonymousUserToken=require("../configuration/server/AnonymousUserToken2");var _AnonymousUserToken2=_interopRequireDefault(_AnonymousUserToken);
var _defaultPersister=require("../configuration/graphql/defaultPersister");var _defaultPersister2=_interopRequireDefault(_defaultPersister);
var _getNewUser=require("../configuration/graphql/model/getNewUser");var _getNewUser2=_interopRequireDefault(_getNewUser);
var _log=require("../server/log");var _log2=_interopRequireDefault(_log);
var _User=require("../configuration/graphql/model/User");var _User2=_interopRequireDefault(_User);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}


var User_0=new _User2.default(
_extends((0,_getNewUser2.default)("00000000-0000-0000-0000-000000000000"),{
id:_defaultPersister2.default.uuidNull(),
UserToken2:_AnonymousUserToken2.default,
User_DisplayName:"Anonymous"}));




var entityDefinitions={};


var setPersisters=new Set();


var deletedRecord={
deleted:true};var


ObjectManager=function(){


function ObjectManager(){_classCallCheck(this,ObjectManager);

this.loadersSingle={};


this.loadersMultiple={};


this.changes={};


this.Viewer_User_id=null;


this.request=null;


this.User_0=User_0;
}_createClass(ObjectManager,[{key:"setViewerUserId",value:function setViewerUserId(


























































Viewer_User_id){
this.Viewer_User_id=Viewer_User_id;
}},{key:"setRequest",value:function setRequest(

req,res){
this.request=req;
this.response=res;
}},{key:"setSiteInformation",value:function setSiteInformation(

siteInformation){
this.siteInformation=siteInformation;
}},{key:"getLoadersSingle",value:function getLoadersSingle(

entityName){
var foundLoaders=this.loadersSingle[entityName];
if(foundLoaders!=null)return foundLoaders;else
return this.loadersSingle[entityName]={};
}},{key:"getLoadersMultiple",value:function getLoadersMultiple(

entityName){
var foundLoaders=this.loadersMultiple[entityName];
if(foundLoaders!=null)return foundLoaders;else
return this.loadersMultiple[entityName]={};
}},{key:"clearLoadersMultiple",value:function clearLoadersMultiple(

entityName){
this.loadersMultiple[entityName]={};
}},{key:"recordChange",value:function recordChange(

entityName,fields,isDeletion){
var records=this.changes[entityName];
if(records==null)records=this.changes[entityName]={};

var id=fields.id;

records[id]=isDeletion?deletedRecord:fields;
}},{key:"getViewerUserId",value:function getViewerUserId()

{
if(this.Viewer_User_id==null)
throw new Error("Object Manager: viewer user id has not been set");

return this.Viewer_User_id;
}},{key:"getRequest",value:function getRequest()

{
if(this.request==null)
throw new Error("Object Manager: request has not been set");

return this.request;
}},{key:"getLoader",value:function getLoader(

entityName,fieldName,multipleResults){
if(!(entityName in entityDefinitions))
throw new Error("Can not find entity type named "+entityName);

var entityDefinition=entityDefinitions[entityName];
var entityType=entityDefinition.EntityType;

var loadersList=multipleResults?
this.getLoadersMultiple(entityName):
this.getLoadersSingle(entityName);
var loader=loadersList[fieldName];
if(loader==null){
if(multipleResults)
loader=new _dataloader2.default(function(filter){return(
entityDefinition.Persister.getObjectList(
entityName,
entityType,
filter));});else



loader=new _dataloader2.default(function(filter){return(
entityDefinition.Persister.getOneObject(
entityName,
entityType,
filter));});



loadersList[fieldName]=loader;
}

return loader;
}},{key:"getOneObject",value:function getOneObject(

entityName,filter){var _this=this;


if(entityName=="User")
if(filter.id==_defaultPersister2.default.uuidNullAsString())
return Promise.resolve(User_0);


var loaderIdentifier=Object.keys(filter).sort().join(",");
var loader=this.getLoader(entityName,loaderIdentifier,false);

return loader.load(filter).then(function(result){
var changes=_this.changes[entityName];
if(changes){
var change=changes[result.id];
if(change!=null){
if(change===deletedRecord)
result=null;else
_extends(result,change);
}
}
return result;
});
}},{key:"getObjectList",value:function getObjectList(

entityName,filter){var _this2=this;

var loaderIdentifier=Object.keys(filter).sort().join(",");
var loader=this.getLoader(entityName,loaderIdentifier,true);

return loader.load(filter).then(function(arrResults){
var changes=_this2.changes[entityName];
if(changes){
for(var ix=0;ix<arrResults.length;ix++){
var change=changes[arrResults[ix].id];
if(change!=null){
if(change===deletedRecord)
arrResults.splice(ix--,1);else
_extends(arrResults[ix],change);
}
}
}
return arrResults;
});
}},{key:"invalidateLoaderCache",value:function invalidateLoaderCache(

entityName,fields){

this.clearLoadersMultiple(entityName);

var loadersSingle=this.getLoadersSingle(entityName);
for(var loaderFieldName in loadersSingle){
if(loaderFieldName==="id")
loadersSingle[loaderFieldName].clear(fields.id);else
delete loadersSingle[loaderFieldName];
}
}},{key:"executeTriggers",value:function executeTriggers(

arrTriggers,fields,oldFields){
var arrPromises=[];
for(var _iterator=arrTriggers,_isArray=Array.isArray(_iterator),_i=0,_iterator=_isArray?_iterator:_iterator[typeof Symbol==="function"?Symbol.iterator:"@@iterator"]();;){var _ref;if(_isArray){if(_i>=_iterator.length)break;_ref=_iterator[_i++];}else{_i=_iterator.next();if(_i.done)break;_ref=_i.value;}var trigger=_ref;
arrPromises.push(trigger(this,fields,oldFields));
}

return Promise.all(arrPromises);
}},{key:"add",value:function add(

entityName,fields){var entityDefinition;return regeneratorRuntime.async(function add$(_context){while(1){switch(_context.prev=_context.next){case 0:
entityDefinition=entityDefinitions[entityName];

if(entityDefinition==null)
console.log("Cound not find entity "+entityName);


if(!fields.id)fields.id=entityDefinition.Persister.uuidRandom();


if(entityName=="User")this.setViewerUserId(fields.id.toString());

this.recordChange(entityName,fields,false);_context.next=7;return regeneratorRuntime.awrap(
this.executeTriggers(entityDefinition.TriggersForAdd,fields));case 7:_context.next=9;return regeneratorRuntime.awrap(

entityDefinition.Persister.add(
entityName,
fields,
entityDefinition.EntityType));case 9:


this.invalidateLoaderCache(entityName,fields);return _context.abrupt("return",

fields.id);case 11:case"end":return _context.stop();}}},null,this);}},{key:"update",value:function update(


entityName,fields){var entityDefinition,oldFields;return regeneratorRuntime.async(function update$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:
entityDefinition=entityDefinitions[entityName];

if(entityDefinition==null)
console.log("XXX Cound not find entity"+entityName);

oldFields=null;
if(entityDefinition.TriggersForUpdateShouldRetrieveCurrentRecord){
oldFields=this.getOneObject(entityName,{
id:fields.id});

}

this.recordChange(entityName,fields,false);_context2.next=7;return regeneratorRuntime.awrap(
this.executeTriggers(
entityDefinition.TriggersForUpdate,
fields,
oldFields));case 7:_context2.next=9;return regeneratorRuntime.awrap(


entityDefinition.Persister.update(entityName,fields));case 9:

this.invalidateLoaderCache(entityName,fields);case 10:case"end":return _context2.stop();}}},null,this);}},{key:"remove",value:function remove(


entityName,fields){var entityDefinition;return regeneratorRuntime.async(function remove$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:
entityDefinition=entityDefinitions[entityName];

this.recordChange(entityName,fields,true);_context3.next=4;return regeneratorRuntime.awrap(
this.executeTriggers(entityDefinition.TriggersForRemove,fields));case 4:_context3.next=6;return regeneratorRuntime.awrap(

entityDefinition.Persister.remove(entityName,fields));case 6:

this.invalidateLoaderCache(entityName,fields);case 7:case"end":return _context3.stop();}}},null,this);}},{key:"cursorForObjectInConnection",value:function cursorForObjectInConnection(


entityName,arr,obj){
var entityDefinition=entityDefinitions[entityName];


var obj_id=entityDefinition.Persister.uuidToString(obj.id);



for(var ix=0;ix<arr.length;ix++){
var arr_element_id=entityDefinition.Persister.uuidToString(arr[ix].id);

if(arr_element_id==obj_id){
arr[ix]=obj;
break;
}
}

var cursor=(0,_graphqlRelay.cursorForObjectInConnection)(arr,obj);
if(cursor==null)
_log2.default.log(
"error",
"Could not create cursor for object in connection for "+entityName,
{
obj:obj,
arr:arr});



return cursor;
}}],[{key:"registerEntity",value:function registerEntity(entityName,EntityType,persister){if(entityName in entityDefinitions)throw new Error("Entity already registered: "+entityName);EntityType.entityName=entityName;if(persister==null)persister=_defaultPersister2.default;setPersisters.add(persister);entityDefinitions[entityName]={EntityName:entityName,EntityType:EntityType,Persister:persister,TriggersForAdd:[],TriggersForUpdate:[],TriggersForRemove:[],TriggersForUpdateShouldRetrieveCurrentRecord:false};}},{key:"RegisterTriggerForAdd",value:function RegisterTriggerForAdd(entityName,handler){entityDefinitions[entityName].TriggersForAdd.push(handler);}},{key:"RegisterTriggerForUpdate",value:function RegisterTriggerForUpdate(entityName,handler,shouldTrerieveCurrentRecord){entityDefinitions[entityName].TriggersForUpdate.push(handler);if(shouldTrerieveCurrentRecord)entityDefinitions[entityName].TriggersForUpdateShouldRetrieveCurrentRecord=true;}},{key:"RegisterTriggerForAddAndUpdate",value:function RegisterTriggerForAddAndUpdate(entityName,handler){ObjectManager.RegisterTriggerForAdd(entityName,handler);ObjectManager.RegisterTriggerForUpdate(entityName,handler);}},{key:"RegisterTriggerForRemove",value:function RegisterTriggerForRemove(entityName,handler){entityDefinitions[entityName].TriggersForRemove.push(handler);}},{key:"initializePersisters",value:function initializePersisters(


runAsPartOfSetupDatabase,
cb)
{
console.log("🚀 Initializing persisters - start ...");


for(var _iterator2=setPersisters,_isArray2=Array.isArray(_iterator2),_i2=0,_iterator2=_isArray2?_iterator2:_iterator2[typeof Symbol==="function"?Symbol.iterator:"@@iterator"]();;){var _ref2;if(_isArray2){if(_i2>=_iterator2.length)break;_ref2=_iterator2[_i2++];}else{_i2=_iterator2.next();if(_i2.done)break;_ref2=_i2.value;}var persister=_ref2;
persister.initialize(runAsPartOfSetupDatabase,function(){
console.log("🏆 Initializing persisters - success.");
cb();
});}
}}]);return ObjectManager;}();exports.default=ObjectManager;


ObjectManager.registerEntity("User",_User2.default);
//# sourceMappingURL=ObjectManager.js.map