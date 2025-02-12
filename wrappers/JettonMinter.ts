import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleItemSlice } from '@ton/core';

export type JettonMinterConfig = {
    totalSupply: bigint;
    adminAddress: Address;
    tgBTCJettonWalletAddress: Address;
    content: Cell;
    jettonWalletCode: Cell;
};

export function jettonMinterConfigToCell(config: JettonMinterConfig): Cell {
    return beginCell()
        .storeCoins(config.totalSupply)
        .storeAddress(config.adminAddress)
        .storeAddress(config.tgBTCJettonWalletAddress)
        .storeRef(config.content)
        .storeRef(config.jettonWalletCode)
        .endCell();
}

export class JettonMinter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new JettonMinter(address);
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const data = jettonMinterConfigToCell(config);
        const init = { code, data };
        return new JettonMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        newAdmin: Address,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(3, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newAdmin)
                .endCell()
        })
    }

    async sendChangeContent(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        newContent: Cell,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(4, 32)
                .storeUint(opts.queryId, 64)
                .storeRef(opts.newContent)
                .endCell()
        })
    }

    async sendChangeTGBTCJettonWallet(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        newTGBTCJettonWallet: Address,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(5, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newTGBTCJettonWallet)
                .endCell()
        })
    }

    async sendUpgradeContract(provider: ContractProvider, via: Sender, value: bigint, opts: {
        queryId: bigint,
        newData: Cell,
        newCode: Cell,
    }) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(999, 32)
                .storeUint(opts.queryId, 64)
                .storeRef(opts.newData)
                .storeRef(opts.newCode)
                .endCell()
        })
    }

    async getJettonData(provider: ContractProvider) {
        let result = await provider.get('get_jetton_data', []);
        return {
            totalSupply: result.stack.readBigNumber(),
            admin: result.stack.readAddress(),
            content: result.stack.readCell(),
            jettonWalletCode: result.stack.readCell(),
        }
    }

    async getWalletAddress(provider: ContractProvider, ownerAddress: Address) {
        let result = await provider.get('get_wallet_address', [
            {
                type: "slice",
                cell: beginCell().storeAddress(ownerAddress).endCell()
            } as TupleItemSlice
        ]);

        return result.stack.readAddress();
    }
}
