function writeLibraries_(name){
  var skipSheets = ["Template","CurrentApis"];

  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  
  for(var i in sheets){
    if(skipSheets.indexOf(sheets[i].getName()) == -1 || (name && sheets[i].getName() == name)){
      
      
      var ret = makeLibrary(sheets[i])
      var libraryProject = 
          { "files": 
           [
             {
               "name": ret.fileName,
               "type": "server_js",
               "source": ret.code
             }
           ]
          };
      
      try{createNewProject(ret.fileName,libraryProject,libOutputfolderId);}
      catch(e){Logger.log(e)}
    }
  }
}



function makeLibrary(sheet,addHeader){
  
  
  var ss = sheet;
  var addHeader = addHeader || true;
  var resources = ss.getRange(9, 1, ss.getLastRow() , ss.getLastColumn()).getValues();
  var docs = ss.getRange(7, 1).getValue();
  var basePath = ss.getRange(1, 1).getValue();
  var scopes = ss.getRange(3, 1, 1, 10).getValues();
  var fileName = ss.getName().charAt(0).toUpperCase() + ss.getName().slice(1);
  var code = ""
    
    
     code += '\n\/**\n'
     code += '* Google Apps Script Library for the '+ss.getName()+' API\n';
     code += "* \n";
     code += '* Documentation can be found: \n';
     code += '* '+ docs +'\n';
     code += '* \n';
     code += '* OAuth2 Scopes\n'
     for(var i in scopes[0]){
       if(scopes[0][i] !== ""){
         code += '* '+scopes[0][i] + "\n"  
       }
     }
     code += '*\/\n\n'; 
     
     code += 'var BASEURL_="'+basePath+'";\n';
     if(addHeader){
       code += ScriptApp.getResource('SharedLibraryFunctions').getDataAsString() + "\n";
     }
      
      
  
  for(var i in resources){
    if(resources[i][0] !== ""){
      code += writeService(resources[i]);
    }
  }
   
   return {fileName:fileName,code:code}
}



function writeService(serviceObj){
  var serviceName = JSON.parse(serviceObj[0]).id.split('.')[1];
  var serviceFunctions = ""; // ['self_.'+serviceName+' = function(){};'];
  for(var i in serviceObj){
    if(serviceObj[i] !== ""){
      serviceFunctions += writeFunction(JSON.parse(serviceObj[i]));
    }
  }
  return serviceFunctions
}
function writeFunction(functionObj){
  var method = functionObj.method;
  var postBody = functionObj.postBody;
  var url = ("\""+ functionObj.urlPath.replace(/\{/g,"\"+").replace(/\}/g,"+\"") + "\"").replace(/\+\"\"/g,'');
  var id = functionObj.id.split('.');
  var service = id.shift();
  var functionId = id.map(function(word,i){return (i == 0)?word: word.charAt(0).toUpperCase() + word.slice(1)}).join('');
  var resourceName = functionObj.resource || "remove";
  var fetchMethod = functionObj.fetchMethod;
  var params = functionObj.params || [];
  if(postBody){params.push(postBody+"Resource")}
  params.push("options");     
  
  
  
  var jsDoc = '\n\/**\n';
  jsDoc += '* '+ functionObj.desc + '\n';
  jsDoc += "*\n";
  
  if(params.length > 0){
    for(var i in params){
      if(params[i] === "options"){
        jsDoc += '* @param {object} options Keypair of all optional parameters for this call\n';
      }else if(params[i].indexOf("Resource") != -1){
        jsDoc += '* @param {object} '+params[i]+' An object containing the '+params[i]+' for this method\n';
      }else
      {
        jsDoc += '* @param {' + functionObj.paramDesc[params[i]].type + '} '+ params[i] + ' ' + functionObj.paramDesc[params[i]].description + '\n';
        
      }
      
      
    }
  }
  
  if(functionObj.resource){
    jsDoc += '* @return {object} The returned '+functionObj.resource+'Resource object\n';
  }
  jsDoc += '*\/\n';
  
 
  
  var newFunction = 'function '+functionId+'('+params.join()+'){'+
    '\n  var path = buildUrl_('+url+',options);';
  if(postBody){
    newFunction +='\n  var callOptions = {method:"'+method+'",payload:JSON.stringify('+(postBody + 'Resource')+')};' 
  }else{
    newFunction +='\n  var callOptions = {method:"'+method+'"};';
  }                  
  
  if(fetchMethod === "CALL"){
    newFunction += '\n  var '+resourceName+'Resource = CALL_(path,callOptions);'
    newFunction += '\n  return '+resourceName+'Resource;';
  }else{
    newFunction += '\n  var '+resourceName+'Items = CALLPAGE_(path,callOptions,"items");'
    newFunction += '\n  return '+resourceName+'Items;';
  }
  newFunction += '\n}\n';
  
  return jsDoc+newFunction; 
}
