const POWbutton = document.querySelector('#pow_button')
const blocksContainer = document.querySelector('.blocks_container')
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

let GenesisBlock = new Block(1, 1518098983, [{from: 'genesis', to: 'genesis', amount: 0}], '00000000000000000000000000000000000000000000000000000000000000', 2984)

let BlockChain = [GenesisBlock]

async function ProofOfWork(blockToMine) {
    let currentBlockHash = await blockToMine.calculateHash()
    while (currentBlockHash > '0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'){
        blockToMine.increaseNonce()
        currentBlockHash = await blockToMine.calculateHash()
    }
    return blockToMine
}


async function createRandomBlock(){
    const height = BlockChain.at(-1).height + 1
    const time = Math.floor(Date.now() / 1000)
    const transactions = [{from: 'alice', to: 'bob', amount: Math.round(Math.random() * 10000) / 1000}, {from: 'bob', to: 'jean', amount: Math.round(Math.random() * 10000) / 1000}]
    const previousHash = await BlockChain.at(-1).calculateHash()
    const nonce = 0
    return new Block(height, time, transactions, previousHash, nonce)
}

let BlockchainEnabled = false

async function addBlocksToBlockChain(){
    while (BlockchainEnabled){
        const block = await createRandomBlock()
        addSeparator()
        addHTMLLoadingBlock(block)
        await ProofOfWork(block)
        BlockChain.push(block)
        removeLoadingBlock()
        addHTMLBlock(block)
        console.log(`Block ${block.height} added`)
    }
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

function toogleBlockchain(){
    BlockchainEnabled = !BlockchainEnabled
    if (BlockchainEnabled){
        POWbutton.innerHTML = 'Stop Mining'
        POWbutton.classList.value = 'mining'
        addBlocksToBlockChain()
    } else {
        POWbutton.innerHTML = 'Start Mining'
        POWbutton.classList.value = 'stop'
    }
}

addHTMLBlock(GenesisBlock)

POWbutton.addEventListener('click', toogleBlockchain)

// améliorer structure du bloc
// améliorer aléatoire transactions
// ajouter arbre de merkel