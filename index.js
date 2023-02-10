import * as fs from 'fs';


async function fetchFileData(inputFilePath, outFilePath){

  var data = fs.readFileSync(inputFilePath, 
    {encoding:'utf8', flag:'r'});

  const filterSubstring = '  function ';
  var allFilteredData = `\n\n\nPATH: ${inputFilePath}\n`;
  while(data.indexOf(filterSubstring) > 0){
    data = data.slice(data.indexOf(filterSubstring));
    var filteredData = data.slice(0, data.indexOf('{')).concat(';');
    data = data.slice(filteredData.length);
    allFilteredData = allFilteredData.concat("\n", filteredData);
  } 

  fs.appendFileSync(outFilePath, allFilteredData,
    { encoding: "utf8", flag: "a" }
    );
}


async function fetchAllFoldersPath(path, pathArray){
  pathArray.push(path)
  const directoriesInDIrectory = fs.readdirSync(path, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  if(directoriesInDIrectory.length > 0){
    directoriesInDIrectory.map(async (p)=>{
      await fetchAllFoldersPath(path.concat('/', p), pathArray);
    });
  }
}


async function fetchAllFilesPath(path, pathArray){
  const filesInDIrectory = fs.readdirSync(path, { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .map((item) => path.concat('/', item.name));
  pathArray.push(...filesInDIrectory);
}


(async ()=>{

  var inputPath = ['../v3-core', '../v3-periphery'];
  const outPutFilePath = 'input.txt';
  var foldersPathArray = [];
  var filessPathArray = [];
  

  inputPath.map(async (path)=>{
    await fetchAllFoldersPath(path, foldersPathArray);
  });
  console.log("foldersPathArray: ", foldersPathArray, foldersPathArray.length);

  foldersPathArray.filter((path)=>{
    return path.includes('contracts')  
    && !path.includes('artifacts')
    && !path.includes('node_modules')
    && !path.includes('contracts/test')
    && !path.includes('contracts/interfaces');
  }).map(async (path)=>{
    await fetchAllFilesPath(path, filessPathArray);
  });

  console.log("filessPathArray", filessPathArray, filessPathArray.length);


  filessPathArray.filter((path)=>{
    return path.includes('.sol') 
  }).map(async (inputFilePath)=> {
    await fetchFileData(inputFilePath, outPutFilePath);
  });
})();
