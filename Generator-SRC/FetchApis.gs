// 0. Run clearAllSheets if you want to easily remove all the generated sheets. 

// 0a. If you need to change the google APIs Url to a GAE endpoint
var discoveryUrl = "https://www.googleapis.com";  // GAE endpoint would look like -> https://MyProjectId.appspot.com/_ah/api

// 1. Run getApiHeaders
// 2. Run getAllApiDetails
// 3. Set the output folder Id
var libOutputfolderId = "1mJj4EHW8s5Uz06peimFDcc3FE_aBUOaY";

// 4. Run writeLibraries

function makeLib(){
  var sheetName = "youtube"
  writeLibraries_(sheetName);
}


function getApiHeaders() {
 var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CurrentApis'),
     url = discoveryUrl + "/discovery/v1/apis";
     items = JSON.parse(UrlFetchApp.fetch(url).getContentText()).items,
     apiList = [], thisApi = [];
  
  if(!ss){
    ss = SpreadsheetApp.getActiveSpreadsheet().insertSheet('CurrentApis',{template:SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Template")})
 }
  //   Logger.log(items)
 for (var i in items){
  thisApi = [items[i].name,		
                items[i].version,	
                items[i].title,	
                items[i].description,	
                items[i].discoveryLink];
   
 apiList.push(thisApi);
 thisApi = "";
 }
 Logger.log(apiList)
 ss.clear();
 var range = ss.getRange(1, 1, apiList.length, 5);
 range.setValues(apiList);
 
}


function getAllApiDetails(){
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CurrentApis");
  var apis = ss.getRange(1, 1, ss.getLastRow(), 6).getValues();
  
  for(var i = 0; i < apis.length;i++){
    if(apis[i][5] == false){continue;}        
    getApi(apis[i][0],apis[i][1]);
  }
}

function writeLibraries(){
  writeLibraries_();
}

function getApi(api,ver){
  try {
    var url = discoveryUrl + "/discovery/v1/apis/"+api+"/"+ver+"/rest",
      apiData = JSON.parse(UrlFetchApp.fetch(url)),
        ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(api),
          apiParams = [],apiScopes = [];
    
    if(!ss){
      ss = SpreadsheetApp.getActiveSpreadsheet().insertSheet(api, 2, {template:SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Template")})
    }
    
    ss.clear();
    ss.appendRow([apiData.baseUrl])
    
    ss.appendRow(["Scopes"]);
    if(apiData.auth){
      for(var scope in apiData.auth.oauth2.scopes){
        apiScopes.push(scope);
      }
    }else{
      apiScopes = ["none"]
    }
    ss.appendRow(apiScopes) 
    
    
    ss.appendRow(["Parameters"])
    for(var i in apiData.parameters){
      apiParams.push(i);
    }
    ss.appendRow(apiParams)
    
    
    ss.appendRow(["DocumentationUrl"]);
    ss.appendRow([apiData.documentationLink]);
    
    ss.appendRow(["Resources"]) 
    getResources(ss,apiData);
  } catch(e) {
    Logger.log(e)
  }
  
}


function getResources(inSS,inObj){
  
   
   if(inObj.methods){
    var methods = [];
      for(var method in inObj.methods){
        
        var apiString = "{\"id\":\"" +
                          inObj.methods[method].id+
                          "\",\"method\":\""+
                          inObj.methods[method].httpMethod+
                          "\",\"urlPath\":\""+
                          inObj.methods[method].path+                          
                          "\",\"desc\":\""+
                          escape(inObj.methods[method].description)+
                          "\"";
        
        
        if(inObj.methods[method].parameterOrder){
          apiString += ",\"params\":"+JSON.stringify(inObj.methods[method].parameterOrder);
          apiString += ",\"paramDesc\":"+JSON.stringify(inObj.methods[method].parameters);
          
        }
        
        
        if(inObj.methods[method].request != undefined){
          apiString += ",\"postBody\":\""+inObj.methods[method].request.$ref+"\"";
        }
        
        
        apiString += ",\"fetchMethod\":";
        if(inObj.methods[method].parameters && inObj.methods[method].parameters.pageToken){
        
         apiString += "\"CALLPAGE\"";
        }else{
         apiString += "\"CALL\"";
        }
        if(inObj.methods[method].response){
         apiString += ",\"resource\":\""+inObj.methods[method].response.$ref+"\"";
        }
        
        apiString += "}";
        methods.push(apiString);
      }
    inSS.appendRow(methods);
    }
    
    if(inObj.resources){
     for(var resource in inObj.resources)
     getResources(inSS,inObj.resources[resource])
  }
  
 }
 
    
function clearAllSheets(){
  var skipSheets = ["Template","CurrentApis"];
  var ss = SpreadsheetApp.getActive();
  var sheets = ss.getSheets();
  for(var i = 0; i < sheets.length;i++){
    if(skipSheets.indexOf(sheets[i].getName()) == -1){
      ss.deleteSheet(sheets[i]);
    }
  }
}


var escape = function (str) {
  if(str){
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
    }else{
     return str;
    }
};

