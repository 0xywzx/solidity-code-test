# Solidity code test

## ローカル環境でbuildする手順

### 1. Ganacheの起動
Ganacheを起動しPortを`7545`に設定してください。

### 2. ディレクトリのclone

```
git clone git@github.com:Yosuke-Aramaki/solidity-code-test.git
cd solidity-code-test
npm i
```

### 3. コントラクトのデプロイ
```
truffle migrate --reset
npm run start
```

### 補足事項
* truffleをインストールしてない方はインストールしてから始めてください。
```
npm install -g truffle@5.0.7
```

* nodeとnpmは下記のバージョンを利用してます。
```
node: v11.14.0
npm: v6.7.0
```


## 動作確認手順

じゃんけんゲームは下記の流れで実装しました。  

```
Step 1. Host Playerがゲームを作る際に、じゃんけんの手と手を秘匿化するPasswordも設定する。  
Step 2. Guest Playerがじゃんけんの手を決めてじゃんけんに参加する。  
Step 3. Host Playerがじゃんけんの手と秘匿化するPasswordを入力してじゃんけんの結果を表示する。  
Step 4. じゃんけんの結果に応じてdepositを引き出せる。  
```

**Step2**の際に、Guest Playerの手は秘匿化されすにコントラクトに書き込まれているため、Host Playerが結果を表示しないことが考えられます。  
そのため、Guest Playerがゲームに参加してから、Host Playerが1時間以内に結果を表示しなかった場合はGuest Playerが全額Depositを引き出せるようにしてます。  

下記、動作確認の手順になります。  

### Metamaskの設定
Metamaskの接続先を`http://127.0.0.1:7545`に設定してください。

### 1. ゲームの作成
![create-game](images/create-game.png)  
じゃんけんの手、Depositの額（単位はEther）、秘匿化するためにのするためのPasswardを設定して`Create Game`ボタンを押してください。  
じゃんけんの手、Passwardは結果を得る時に必要になるので忘れないようにメモしてください。  

![waiting-guest](images/waiting-guest.png)  
ゲームの作成に成功すると "Hosted Game List" に作成したゲームが現れ、**Waiting guest**と表示されます。  

### * Guest Playerが参加しない場合
![no-guest-joined](images/no-guest-joined.png)  
一時間経ってもGuest Playerが参加しない場合は、**No guest joined**と表示され、デポジットを引き出せるようになります。  

### 2. じゃんけんに参加する
![join-game](images/join-game.png)  
Metamaskのアカウントを切り替えてリロードし、**Open Game List**からじゃんけんの手を設定してゲームに参加してください。  
ここでの**Ether: 1**は、このゲームに参加するには **1 Ether** のデポジットする必要があるという意味です。  

![waiting-host-response](images/waiting-host-response.png)  
ゲームに参加できたら"Hosted Game List" に作成したゲームが現れ、**Waiting host response**と出てきます。  

### * Host Playerが結果を返さない場合
![no-host-response](images/no-host-response.png)  
一時間経ってもHost Playerが結果を返さない場合は、**No host response**と表示され、全デポジットを引き出せるようになります。  

### 3. 結果を表示する
![show-result](images/show-result.png)  
Metamaskのアカウントを切り替えてリロードし、**Hosted Game List**からじゃんけんの結果を表示してください。  
じゃんけんの手とpasswordは同じものを使用してください。  

#### 勝った場合
![win](images/win.png)  
勝った場合は**You win!**と表示され`Get ether`ボタンから、相手がDepositした分のEtherを引き出すことができます。  

### 引き分けの場合
![draw](images/draw.png)  
引き分けの場合は**Draw**と表示され`Get ether`ボタンから、Depositした額のEtherを取り出すことができます。  

### 負けた場合
![lose](images/lose.png)  
引き分けの場合は**You lose**と表示されDepositした額のEtherは相手に渡ります。  

## コントラクトに関して
mappingを用いて複数ゲームを1つのコントラクトで管理する実装にしました。  
まずガス代削減のために1つのコントラクトで1つのゲームを繰り返し管理することを考えましたが、他の人たちのじゃんけんゲームが終わるまで他のじゃんけんを始めることができないので使いやすさにかけると考えました。  
複数のじゃんけんを管理する方法として、１つのゲームができるじゃんけんコントラクトとデプロイしてもらい、そのコントラクトアドレスを他のコントラクトで保存することも考えました。ですが、コントラクトアドレスを書き込む時にエラーが生じた場合deoisitが取り出せなくなる可能性があります。  
これらから総合的に判断して、ガス代は少し高くなりますが現在開発している実装にしました。  

## コントラクトのテスト
コントラクトのテストも簡単に書きました。

```
truffle test
```

## ガス代に関して

|Function | |Web3 (wei) |Slow (ETH) |Avg (ETH) |Fast (ETH) |Metamask (ETH) |
|---|---|---|---|---|---|---|
|1. createGame || 182216 | 0.000273 | 0.001367 | 0.002187 | 0.005466|
|2. joinGame || 101014 | 0.000174 | 0.0004 | 0.001393 | 0.00303|
|3. gameResult || 78147 | 0.000117 | 0.00034 | 0.000821 | 0.002344|
|4. getDepositedEtherFromWinner || 78523 | 0.000118 | 0.000342 | 0.000942 | 0.002356|
|5. getDepositedEther || 38628 | 0.000058 | 0.00029 | 0.000464 | 0.001159|
|6. closeGame || 87968 | 0.000132 | 0.000396 | 0.000924| 0.002315|
|7. closeGameByGuest || 72990 | 0.000164 | 0.000547 | 0.000876| 0.002195|
> gasPrice = 20000000000

#### Gas代概算

|---|---|---|---|---|---|---|
|Sum(1~4)    || 439900 | 0.000682 | 0.002449 | 0.005343 | 0.013196 | 
|Sum(1~3, 5) || 400005 | 0.000622 | 0.002397 | 0.004865 | 0.011999 | 

|---|---|---|---|---|---|---|
|Sum(2, 4) || 179537 | 0.000292 | 0.000724 | 0.002335 | 0.005386 | 
|Sum(2, 5) || 139642 | 0.000232 | 0.000690 | 0.001857 | 0.004189 |

Gas代：Host側　10円〜80円、 Guest側　5円〜40円

```
const createGame = await this.state.gameContract.methods.createGame(0, "pass").estimateGas({ from: this.state.account, value: depositAmount })
const joinGame = await this.state.gameContract.methods.joinGame(1, 0).estimateGas({ from: this.state.account, value: depositAmount })
const gameResult = await this.state.gameContract.methods.gameResult(1, 0, "pass").estimateGas({ from: this.state.account })
const getDepositedEtherFromWinner = await this.state.gameContract.methods.getDepositedEtherFromWinner(1).estimateGas({ from: this.state.account })
const getDepositedEther = await this.state.gameContract.methods.getDepositedEther(2).estimateGas({ from: this.state.account })
const closeGame = await this.state.gameContract.methods.closeGame(1).estimateGas({ from: this.state.account })
const closeGameByGuest = await this.state.gameContract.methods.closeGameByGuest(1).estimateGas({ from: this.state.account })
```

## ディレクトリ構造
.  
│── README.md  
│── contracts  
│   │── GameContract.sol  
│   └── Migrations.sol  
│── migrations  
│   │── 1_initial_migration.js  
│   └── 2_gameContract_migration.js  
│── scripts  
│   └── seed-games.js (初期データの作成)  
│── src  
│   │── App.css  
│   │── App.js  
│   │── abis  
│   │   │── GameContract.json  
│   │   └── Migrations.json  
│   │── index.css  
│   │── index.js  
│   │── serviceWorker.js  
│   └── web3.js  
│── test  
│   └── GameContract.test.js  
└── truffle-config.js  
