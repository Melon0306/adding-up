'use strict';
const fs = require('fs');//repuire(要求する)fsは扱う
const readline = require('readline');//一行ずつ読んでいく
// 上二つは、 Node.js に用意されたモジュールを呼び出している。
const rs = fs.ReadStream('./popu-pref.csv');//. 現在のディレクトリ。fsのRSをrsに
const rl = readline.createInterface({ 'input': rs, 'output': {} });//読み込みの設定作成。rsから読み込むという意味
// 上二つは、popu-pref.csv ファイルから、ファイルを読み込みを行う Stream を生成し、
//さらにそれを readline オブジェクトの input として設定し、 rl オブジェクトを作成している。これも Stream のインタフェースを持っている
const prefectureDataMap = new Map();//３ key(添字): 都道府県 value(値): 集計データのオブジェクト
// ３↑↑集計されたデータを格納する連想配列

//↓↓一部を読み取るlineイベ　→→ここから関数　　　lineString 一行分の文字列が入った変数
rl.on('line', (lineString) => {//上のを利用するためのもの
    const columns = lineString.split(',');
//※１.split('');で引数lineStringで与えられた文字列をカンマで分割してcolumnsという配列にしてる。
    const year = parseInt(columns[0]);//columns コラム 0は年　数字がほしいのでparseInt使用
    const prefecture = columns[2];//prefecture　県名2　県名は文字列なのでparseIntは✖
    const popu = parseInt(columns[7]);//popu→population 7人口15~20年
// ※２↑↑三つ
    if (year === 2010 || year === 2015) {//2010か2015年だったら出力する
        let value = prefectureDataMap.get(prefecture);//value 値という変数
        if(!value){ //!value は値が無し(Falsyという意味 だったら実行するもの↓↓
            value ={
                popu10: 0,//2010年　変数を作ったらnullや0を最初に作る
                popu15: 0,//2015年  Falsy の場合に、value に初期値となるオブジェクトを代入します
                change: null
            };
        }
        if(year === 2010){
            value.popu10 += popu;//値を足して更新という意味(左+右の値を左に再代入)
        }//男性で足した後女性の値も加えたいので
        if(year === 2015){
            value.popu15 += popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
// yearが2010か2015である時のif文　これのみコンソールに出力される
});//　　　　　　↓最後なので引数無し
rl.on('close', ()=>{//全てを読み込んだら下を読み込む
    　//　　県名↓　 ↓数値    ↓を一つ一つの要素ずつへループするという意味
    for(let [key,value] of prefectureDataMap){//４ ※３ 県のデータが揃ったあとでしか正しく行えないのでcloseにいれる
        value.change = value.popu15/value.popu10;//1~が増加、~１が減少になる計算式
    }//オブジェクトの値にアクセスするので.で繋げる↑↑　　　　↓↓sort関数(配列の並びを簡単にする関数)連想は×
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {//５
                            //↑↑連想配列(順番を持たないので)を普通の配列に変換してる
        return pair2[1].change - pair1[1].change;//大きい順にsortする [0]はkey,[1]は値が
    });　　　　　　　//2015変化率ー2010変化率↑↑
    // 　　　　　　　　　　　　　　map関数↓↓ 上の連想配列のmapとは別物
    const rankingStrings = rankingArray.map(([key, value]) =>{//この[key, value]で値を取りループさせていく
        return key +': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change;
    });//都道府県　　　　　　　2010                2015                           変化率
    console.log(rankingStrings);
});
// モジュール(部品)は組み合わせて使う。色々な機能が用意されているので、使えば、自分で一から処理を書かなくても済む
// ・fs(FileSystem) ファイルを扱うモジュール 
// ・readline　ファイルを一行ずつ読み込むためのモジュール
// ・Stream 非同期で情報を取り扱うための概念で、情報自体ではなく情報の流れに注目する
// 入出力が発生する処理をほとんど Stream という形で扱う。使うと一部分の読み込みで処理発生できる。
// stream.Readable - 読み取りだけができるストリーム
// stream.Writable - 書き込みだけができるストリーム
// stream.Duplex - 読み取りも書き込みもできるストリーム
// stream.Transform - 読み取ったデータを変換して出力するストリーム

// ※１"ab,cde,f" という文字列であれば、["ab", "cde", "f"]という文字列からなる配列に分割されます。
//　　splitの例
// 　'〇〇、△△、✖✖'.split('、'); だとカンマごと区切って出力される
// 　.split('、')[0];　だと〇〇が出力
// ※２配列 columns の要素へ並び順の番号でアクセスして、集計年、都道府県、15〜19 歳の人口、をそれぞれ変数に保存しています。
// 　parseInt() は、文字列を整数値に変換する関数です。
// 　lineString.split() は、文字列を対象とした関数なので、結果も文字列の配列になってるが、
// 　集計年や 15〜19 歳の人口は数値なので、文字列のままだとのちのち数値と比較したときなどに不都合が生じます。
// 　そこで、これらの変数を文字列から数値に変換するために、parseInt() を使っている。
// ※３　 for-of 構文
// Map や Array の中身を of の前に与えられた変数に代入して for ループと同じことができる。