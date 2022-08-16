let files1;     //「a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022」直下のファイル(フォルダとjson)をstringとして格納
let files2 = [];     //各フォルダ内のjsonを一時的にstringとして格納
let FolderNum = 0;
let UsersInfo;  //users.jsonを格納

//filses1をGetする
function GetFile1() {
    return new Promise(resolve => {
        fs = require('fs');
        fs.readdir('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/', (err, files) => {
            resolve(files);
        });
    });
}

//files2をGetする
function GetFile2(num) {
    return new Promise(resolve => {
        fs = require('fs');
        fs.readdir('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/'+files1[num], (err, files) => {
            resolve(files);
        });
    });
}

//users.jsonを取ってくる
function GetUsersInfo() {
    return new Promise(resolve => {
        UsersInfo = require('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/users.json');
        resolve(UsersInfo);
    });
}

//全てのファイル・フォルダを順次表示させる
async function ViewAllFiles() { //await を使うためには async が必要
    files1 = await GetFile1();
    console.log("ファイル数:"+files1.length);
    for(let i=0;i<files1.length;i++){
        if(files1[i].substring(files1[i].length-4,files1[i].length)!="json"){
            files2[FolderNum] = await GetFile2(i);
            console.log("\n"+i+"個目のファイル: "+files1[i]);
            console.log(files2[FolderNum++]);
        }
        else{
            console.log("\n"+i+"個目のファイル: "+files1[i]);
        }
    }
}

GetUsersInfo();

ViewAllFiles();

//users.jsonにあるreal_nameだけを表示させてみてる。同期処理でこちらが早く表示されてしまう(?)
for(let i = 0;i<UsersInfo.length;i++)console.log(UsersInfo[i].real_name);



////
function Test() {
    console.log(files1[11]);
    console.log(files2[11][files2[11].length-1]);
}

setTimeout(Test,1000);