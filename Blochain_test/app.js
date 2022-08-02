const POWbutton = document.querySelector('#pow')

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
        console.log(block)
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

let GenesisBlock = new Block(1, 1518098983, [{from: 'genesis', to: 'genesis', amount: 0}], '00000000000000000000000000000000000000000000000000000000000000', 0)

let BlockChain = [GenesisBlock]

const block1 = new Block(2, 2318098983, [{from: 'alice', to: 'bob', amount: 4.232}, {from: 'bob', to: 'jean', amount: 1.827}], 'fe47d54ab78c4', 0)

let currentBlockHash = 'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

async function ProofOfWork() {
    while (currentBlockHash > '000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'){
        block1.increaseNonce()
        currentBlockHash = await block1.calculateHash()
    }

    console.log(currentBlockHash)
    console.log('POW done')
    console.log(block1.nonce)
}

POWbutton.addEventListener('click', ProofOfWork)
