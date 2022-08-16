let files1;     //「a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022」直下のファイル(フォルダとjson)をstringとして格納
let files2 = [];     //各フォルダ内のjsonを一時的にstringとして格納
let FolderNames = []; //files1からjsonを除いたもの

//FolderNamesがfiles2に対応している。0_attendance_checkの名前は FolderNames[0] から読み取れる。 それの中身は files2[0] にある。

let UsersInfo;  //users.jsonを格納
let ChannelsInfo;

fs = require('fs');

//filses1をGetする
function GetFile1() {
    return new Promise(resolve => {
        fs.readdir('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/', (err, files) => {
            resolve(files);
        });
    });
}

//files2とFolderNamesをGetする
async function GetFile2() {
    let preFiles = [];
    let FolderNum = 0;
    for(let i=0;i<files1.length;i++){
        if(files1[i].substring(files1[i].length-4,files1[i].length)!="json"){
            FolderNames[FolderNum] = files1[i];
            preFiles[FolderNum++] = await GetUnderFiles(i);
        }
    }
    return preFiles;
}

function GetUnderFiles(num) {
    return new Promise(resolve => {
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

//channels.jsonを取ってくる
function GetChannelsInfo() {
    return new Promise(resolve => {
        ChannelsInfo = require('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/channels.json');
        resolve(ChannelsInfo);
    });
}

//全てのファイル・フォルダを順次表示させる
async function ViewAllFiles() {
    files1 = await GetFile1();
    console.log("ファイル数:"+files1.length);
    let FolderNum=0;
    for(let i=0;i<files1.length;i++){
        if(files1[i].substring(files1[i].length-4,files1[i].length)!="json"){
            files2[FolderNum] = await GetUnderFiles(i);
            console.log("\n"+i+"個目のファイル: "+files1[i]);
            console.log(files2[FolderNum++]);
        }
        else{
            console.log("\n"+i+"個目のファイル: "+files1[i]);
        }
    }
}

async function main() {
    GetChannelsInfo();
    GetUsersInfo();
    files1 = await GetFile1();
    files2 = await GetFile2();
    //console.log(files1);
    //console.log(files2.length);
    //console.log(ChannelsInfo.length);

    for(let i=0; i<files2.length; i++){
        console.log(FolderNames[i]);
        console.log(files2[i]);
    }
}

main();