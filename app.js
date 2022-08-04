const POWbutton = document.querySelector('#pow_button')
const blocksContainer = document.querySelector('.blocks_container')
let Block = class {
    constructor(height, timestamp, transactions, previousHash, nonce) {
        this.height = height;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = nonce;
    }
    printBlock() {
        console.log({
            height: this.height,
            timestamp: this.timestamp,
            transactions: this.transactions,
            previousHash: this.previousHash,
            nonce: this.nonce
        })
    }
    async calculateHash() {
        const block = JSON.stringify({
            height: this.height,
            timestamp: this.timestamp,
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
    const timestamp = Math.floor(Date.now() / 1000)
    const transactions = [{from: 'alice', to: 'bob', amount: Math.round(Math.random() * 10000) / 1000}, {from: 'bob', to: 'jean', amount: Math.round(Math.random() * 10000) / 1000}]
    const previousHash = await BlockChain.at(-1).calculateHash()
    const nonce = 0
    return new Block(height, timestamp, transactions, previousHash, nonce)
}

let BlockchainEnabled = false

async function addBlocksToBlockChain(){
    while (BlockchainEnabled){
        const block = await createRandomBlock()
        await ProofOfWork(block)
        BlockChain.push(block)
        addSeparator()
        addHTMLBlock(block)
        console.log(`Block ${block.height} added`)
    }
}

function toogleBlockchain(){
    BlockchainEnabled = !BlockchainEnabled
    if (BlockchainEnabled){
        POWbutton.innerHTML = 'Stop Mining'
        POWbutton.classList.value = 'mining'
    } else {
        POWbutton.innerHTML = 'Start Mining'
        POWbutton.classList.value = 'stop'
    }
    addBlocksToBlockChain()
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

function addSeparator() {
    const separator = document.createElement('div')
    separator.classList.value = 'separator'
    blocksContainer.appendChild(separator)
}

addHTMLBlock(GenesisBlock)

POWbutton.addEventListener('click', toogleBlockchain)

// add loading animation when mining
// replacer trait par chaine