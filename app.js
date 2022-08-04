const POWbutton = document.querySelector('#pow_button')
const blocksContainer = document.querySelector('.blocks_container')
const difficultyButtons = document.querySelectorAll('#easy, #medium, #hard')
const resetButton = document.querySelector('#reset')
const scrollTopButton = document.querySelector('.scroll-top')

let Block = class {
    constructor(height, time, transactions, previousHash, nonce) {
        this.height = height;
        this.time = time;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = nonce;
    }
    printBlock() {
        console.log({
            height: this.height,
            time: this.time,
            transactions: this.transactions,
            previousHash: this.previousHash,
            nonce: this.nonce
        })
    }
    async calculateHash() {
        const block = JSON.stringify({
            height: this.height,
            time: this.time,
            transactions: this.transactions,
            previousHash: this.previousHash,
            nonce: this.nonce
        })
        const encoder = new TextEncoder()
        const data = encoder.encode(block)
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = await Array.from(new Uint8Array(hashBuffer))
        const hashHex = await hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        return hashHex
    }
    increaseNonce() {
        this.nonce += 1;
    }
}

let GenesisBlock = new Block(1, 1659611168, [{from: 'alice', to: 'bob', amount: 1}], '0000000000000000000000000000000000000000000000000000000000000000', 42361)

let BlockChain = [GenesisBlock]
let maxHashValue = '0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
let BlockchainEnabled = false
let reset = false
let isMining = false

async function ProofOfWork(blockToMine) {
    let currentBlockHash = await blockToMine.calculateHash()
    isMining = true
    while ((currentBlockHash > maxHashValue ) && !reset){
        blockToMine.increaseNonce() 
        currentBlockHash = await blockToMine.calculateHash()
    }
    isMining = false
    if (POWbutton.classList.contains('disabled')){
        POWbutton.classList.remove('disabled')
    }
    return blockToMine
}

async function createRandomBlock(){
    const height = BlockChain.at(-1).height + 1
    const time = Math.floor(Date.now() / 1000)
    const transactionsNumber = Math.floor(Math.random() * 10) + 1
    const transactions = []
    for (let i = 0; i < transactionsNumber; i++){
        const names = ['bob', 'alice', 'sophie', 'suzie', 'marc', 'josuha']
        const sender = names[Math.floor(Math.random() * 6 - 0.01)]
        const recipient = names[Math.floor(Math.random() * 6 - 0.01)]
        const amount = Math.round(Math.random() * 10000) / 1000
        const transaction = {from: sender, to: recipient, amount}
        transactions.push(transaction)
    }
    const previousHash = await BlockChain.at(-1).calculateHash()
    const nonce = 0
    return new Block(height, time, transactions, previousHash, nonce)
}

function addHTMLBlock(block){
    const blockHTML = document.createElement('div')
    blockHTML.classList.value = 'block'
    blockHTML.innerHTML =
    `
    <h3 class="height">Block<br>${block.height} </h3>
    <p class="nonce">nonce:<br>${block.nonce}</p>
    `
    blocksContainer.appendChild(blockHTML)
}

function addHTMLLoadingBlock(block){
    const blockHTML = document.createElement('div')
    blockHTML.classList.value = 'block'
    blockHTML.innerHTML =
    `
    <h3 class="height">Block<br>${block.height} </h3>
    <img src="img/loading.svg" class="loading" />
    `
    blocksContainer.appendChild(blockHTML)
}

function removeLoadingBlock(){
    const loadingBlock = document.querySelector('.blocks_container .block:last-child')
    const isLoadingBlock = loadingBlock.querySelectorAll('img.loading').length > 0
    if (isLoadingBlock){
        loadingBlock.remove()
    }
}

function addSeparator() {
    const separator = document.createElement('img')
    separator.classList.value = 'separator'
    separator.src = 'img/chain.svg'
    blocksContainer.appendChild(separator)
}

async function addBlocksToBlockChain(){
    while (BlockchainEnabled){
        const block = await createRandomBlock()
        addSeparator()
        addHTMLLoadingBlock(block)
        await ProofOfWork(block)
        if (!reset){
            BlockChain.push(block)
            removeLoadingBlock()
            addHTMLBlock(block)
            console.log(`Block ${block.height} added`)
        }
        else {
            reset = false
        }
    }
}


function toogleBlockchain(){
        if (BlockchainEnabled){
            BlockchainEnabled = false
            POWbutton.innerHTML = 'Start Mining'
            POWbutton.classList.value = 'stop disabled'
        } else {
            if (!isMining){
                BlockchainEnabled = true
                POWbutton.innerHTML = 'Stop Mining'
                POWbutton.classList.value = 'mining'
                reset = false
                addBlocksToBlockChain()
            }
        }
}

addHTMLBlock(GenesisBlock)

POWbutton.addEventListener('click', toogleBlockchain)

function resetBlockChain() {
    BlockChain = [GenesisBlock]
    reset = true
    blocksContainer.innerHTML = ''
    addHTMLBlock(GenesisBlock)
}

resetButton.addEventListener('click', resetBlockChain)

function changeMiningDifficulty(e) {
    newMiningDifficulty = e.target.value
    switch(newMiningDifficulty){
        case 'easy':
            maxHashValue = '000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            break
        case 'medium':
            maxHashValue = '0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            break
        case 'hard':
            maxHashValue = '00000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            break
    }
}

difficultyButtons.forEach((button) => {
    button.addEventListener('click', changeMiningDifficulty)
})

scrollTopButton.addEventListener('click', () => {
    window.scroll({top: 0, behavior: 'smooth'})
})
