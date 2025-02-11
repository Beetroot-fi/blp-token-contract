import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type JettonWalletConfig = {
    balance: bigint;
    ownerAddress: Address;
    jettonMasterAddress: Address;
    jettonWalletCode: Cell;
};

export function jettonWalletConfigToCell(config: JettonWalletConfig): Cell {
    return beginCell()
        .storeCoins(config.balance)
        .storeAddress(config.ownerAddress)
        .storeAddress(config.jettonMasterAddress)
        .storeUint(0, 32)
        .storeUint(0, 4)
        .storeRef(config.jettonWalletCode)
        .endCell();
}

export class JettonWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new JettonWallet(address);
    }

    static createFromConfig(config: JettonWalletConfig, code: Cell, workchain = 0) {
        const data = jettonWalletConfigToCell(config);
        const init = { code, data };
        return new JettonWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        jettonAmount: bigint,
        toOwnerAddress: Address,
        fwdTonAmount: bigint,
        forwardPayload: Cell | null,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xf8a7ea5, 32)
                .storeUint(opts.queryId, 64)
                .storeCoins(opts.jettonAmount)
                .storeAddress(opts.toOwnerAddress)
                .storeAddress(opts.toOwnerAddress)
                .storeBit(0)
                .storeCoins(opts.fwdTonAmount)
                .storeMaybeRef(opts.forwardPayload)
                .endCell()
        })
    }

    async sendBurn(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        amount: bigint,
        responseAddress: Address,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x595f07bc, 32)
                .storeUint(opts.queryId, 64)
                .storeCoins(opts.amount)
                .storeAddress(opts.responseAddress)
                .storeUint(0, 1)
                .endCell(),
        })
    }

    async getWalletData(provider: ContractProvider) {
        let result = await provider.get('get_wallet_data', []);
        return {
            balance: result.stack.readBigNumber(),
            owner: result.stack.readAddress(),
            jettonMinter: result.stack.readAddress(),
            jettonWalletCode: result.stack.readCell(),
        }
    }

    async getDepositData(provider: ContractProvider) {
        let result = await provider.get('get_deposit_data', []);
        return {
            depositTimestamp: result.stack.readBigNumber(),
            apy: result.stack.readBigNumber(),
        }
    }
}
