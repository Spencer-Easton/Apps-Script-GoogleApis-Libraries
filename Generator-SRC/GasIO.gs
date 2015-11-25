function createNewProject(projectName,content,folderId){
  
  var emptyProject = 
      { "files": 
       [
         {
           "name": "code",
           "type": "server_js",
           "source": "function myFunction(){\n}"
         }
       ]
      };
  
  
  var newProject = {
    title:projectName,
    mimeType: 'application/vnd.google-apps.script+json'
  };
  
  if(folderId != null){
    newProject.parents=
      [
        {
          "kind": "drive#fileLink",
          "id": folderId
        }
      ];
  }
  
  var newFile;
  
  if(content == null){newFile = Drive.Files.insert(newProject,Utilities.newBlob(JSON.stringify(emptyProject),"application/vnd.google-apps.script+json" ),{"convert":true});}
  else{newFile = Drive.Files.insert(newProject, Utilities.newBlob(JSON.stringify(content),"application/vnd.google-apps.script+json" ),{"convert":true} );}
  
  return newFile
}
