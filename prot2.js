const { Console } = require('console');
const { resolve } = require('path');

let files1;     //「a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022」直下のファイル(フォルダとjson)をstringとして格納
let files2 = [];     //各フォルダ内のjsonを一時的にstringとして格納
let FolderNames = []; //files1からjsonを除いたもの

//FolderNamesがfiles2に対応している。0_attendance_checkの名前は FolderNames[0] から読み取れる。 それの中身は files2[0] にある。

let UsersInfo;  //users.jsonを格納
let ChannelsInfo;

let TempFolderNum;  //あるフォルダーを一時的に格納
let TempJson;   //あるjsonを一時的に格納

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
    for (let i = 0; i < files1.length; i++) {
        if (files1[i].substring(files1[i].length - 4, files1[i].length) != "json") {
            FolderNames[FolderNum] = files1[i];
            preFiles[FolderNum++] = await GetUnderFiles(i);
        }
    }
    return preFiles;
}

function GetUnderFiles(num) {
    return new Promise(resolve => {
        fs.readdir('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/' + files1[num], (err, files) => {
            resolve(files);
        });
    });
}

function GetTempJson(num, i) {
    return new Promise(resolve => {
        let json = require('./a-gakusai2022_Slack_export_Mar_29_2022_-_Aug_1_2022/' + FolderNames[num] + '/' + files2[num][i]);
        resolve(json);
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

//idをリアルネームに変換する。
function IdToName(id) {
    return new Promise(resolve => {
        for (let i = 0; i < UsersInfo.length; i++) {
            if (id == UsersInfo[i].id) {
                resolve(UsersInfo[i].real_name);
            }
        }
    });
}

async function TextTreat(JsonInpart) {
    if (JsonInpart["thread_ts"]) {
        await ThreadSearch(JsonInpart);
    }
    else if (JsonInpart["subtype"]) {
        console.log(await IdToName(JsonInpart.user) + "\t" + await UNIXtoDateText(JsonInpart.ts));
        let type = JsonInpart["subtype"];
        if (type == "channel_join") {
            console.log("System : チャンネルに参加しました");
        }
        else if (type == "channel_name") {
            console.log("System : " + JsonInpart.text);
        }
        else console.log("このsubtypeはまだ定義されていません\nError\nError\nError\nError");

        if (JsonInpart["files"]) {
            attachFiles(JsonInpart);
        }

        console.log();
    }
    else {
        console.log(await IdToName(JsonInpart.user) + "\t" + await UNIXtoDateText(JsonInpart.ts));
        console.log(JsonInpart.text);
        if (JsonInpart["files"]) {
            attachFiles(JsonInpart);
        }
        console.log();
    }
}

async function ThreadSearch(JsonInpart) {
    //スレッドの子だった場合、スキップする。
    if (JsonInpart.ts != JsonInpart.thread_ts) {
        //[チャンネルにも投稿]の場合はスキップしない
        if (JsonInpart["subtype"] == "thread_broadcast") {
            console.log(await IdToName(JsonInpart.user) + "\t" + await UNIXtoDateText(JsonInpart.ts));
            if (JsonInpart.root.text.length > 30) console.log("【このスレッドに返信しました : " + JsonInpart.root.text.slice(0, 25) + "...】\n" + JsonInpart.text + "\n");
            else {
                console.log("【このスレッドに返信しました : " + JsonInpart.root.text + "】\n" + JsonInpart.text);
                if (JsonInpart["files"]) {
                    attachFiles(JsonInpart);
                }
                console.log();
            }
        }
    }
    else {   //スレッドrootの場合
        console.log(await IdToName(JsonInpart.user) + "\t" + await UNIXtoDateText(JsonInpart.ts) + "\t【スレッド元】");
        console.log(JsonInpart.text);
        if (JsonInpart["files"]) {
            attachFiles(JsonInpart);
        }
        console.log();
        //連なる返信をサーチ＆表示
        for (let i = 0; i < files2[TempFolderNum].length; i++) {
            let threadJson = await GetTempJson(TempFolderNum, i);
            for (let j = 0; j < threadJson.length; j++) {
                if (JsonInpart.thread_ts == threadJson[j].thread_ts && JsonInpart.ts != threadJson[j].ts) {
                    console.log(await IdToName(threadJson[j].user) + "\t" + await UNIXtoDateText(threadJson[j].ts) + "\t【スレッドに返信】");
                    if (threadJson[j]["subtype"] == "thread_broadcast") {
                        console.log("【チャンネルにも投稿されています。】");
                    }
                    console.log(threadJson[j].text);
                    if (threadJson[j]["files"]) {
                        attachFiles(threadJson[j]);
                    }
                    console.log();
                }
            }
        }
    }
}

function attachFiles(JsonElement) {
    console.log("《添付ファイルがあります :");
    for (let i = 0; i < JsonElement.files.length; i++) {
        if (i == JsonElement.files.length - 1) console.log("\t" + JsonElement.files[i].name + "》計"+(i+1)+"つ");
        else console.log(JsonElement.files[i].name);
    }
}

//タイムスタンプを "2022/M/D HH:MM" の形式に変換する。
function UNIXtoDateText(ts) {
    return new Promise(resolve => {
        let dateTime = new Date(ts * 1000);
        let Text = dateTime.toLocaleDateString() + " " + dateTime.toLocaleTimeString().slice(0, 5);
        if (Text[Text.length - 1] == ":") Text = Text.slice(0, Text.length - 1);
        resolve(Text);
    });
}

//全てのファイル・フォルダを順次表示させる
async function ViewAllFiles() {
    files1 = await GetFile1();
    console.log("ファイル数:" + files1.length);
    let FolderNum = 0;
    for (let i = 0; i < files1.length; i++) {
        if (files1[i].substring(files1[i].length - 4, files1[i].length) != "json") {
            files2[FolderNum] = await GetUnderFiles(i);
            console.log("\n" + i + "個目のファイル: " + files1[i]);
            console.log(files2[FolderNum++]);
        }
        else {
            console.log("\n" + i + "個目のファイル: " + files1[i]);
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
    //console.log(UsersInfo);

    for (let i = /*0*/1; i </*files2.length*/2; i++) {
        TempFolderNum = i;
        //console.log(i);
        console.log(FolderNames[i]);
        console.log(files2[i]);
        for (let j = 0; j < files2[i].length; j++) {
            //console.log(j);
            TempJson = await GetTempJson(i, j);
            for (let k = 0; k < TempJson.length; k++) {
                //console.log(await IdToName(TempJson[k].user) + "\t" + await UNIXtoDateText(TempJson[k].ts));
                await TextTreat(TempJson[k]);
            }
        }
    }
}

main();