# Solidity code test

## ローカル環境でbuildする手順
Ganacheを起動しPortを`7545`に設定してください。

```
git clone 
cd solidity-code-test
npm i
truffle migrate --reset
npm run start
```

* truffleをインストールしてない方はインストールしてから始めてください。
```
npm install -g truffle@5.0.7
```

## 動作確認手順

### 1. ゲームの作成

じゃんけんの手、Depositの額（単位はEther）、秘匿化するためにのするためのPasswardを設定して`Create Game`ボタンを押してください。
じゃんけんの手、Passwardは結果を得る時に必要になるので忘れないようにメモしてください。

### 2. じゃんけんに参加する



## ディレクトリ構造
.<br />
│── README.md<br />
│── contracts<br />
│   │── GameContract.sol<br />
│   └── Migrations.sol<br />
│── migrations<br />
│   │── 1_initial_migration.js<br />
│   └── 2_gameContract_migration.js<br />
│── scripts<br />
│   └── seed-games.js (初期データの作成)<br />
│── src<br />
│   │── App.css<br />
│   │── App.js<br />
│   │── abis<br />
│   │   │── GameContract.json<br />
│   │   └── Migrations.json<br />
│   │── index.css<br />
│   │── index.js<br />
│   │── serviceWorker.js<br />
│   └── web3.js<br />
│── test<br />
│   └── GameContract.test.js<br />
└── truffle-config.js<br />
