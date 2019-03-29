function createNewProject(projectName,content,folderId){
  
  ScriptAPILibrary.setTokenService(function(){ return ScriptApp.getOAuthToken()});   
  var newProject = ScriptAPILibrary.projectsCreate({title: projectName});
  content.files[0].lastModifyUser = newProject.creator;    
  var manifest = ScriptAPILibrary.projectsGetContent(newProject.scriptId).files[0];
  content.files.push(manifest); 
  var results = ScriptAPILibrary.projectsUpdateContent(newProject.scriptId, content); 
  moveFile(newProject.scriptId,folderId);
}



function moveFile(fileId, folderId){
   var file  = DriveApp.getFileById(fileId);
  var currFolder = file.getParents().next();
  var newFolder = DriveApp.getFolderById(folderId);
  newFolder.addFile(file);
  currFolder.removeFile(file);
}