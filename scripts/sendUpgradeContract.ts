import { Address, beginCell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonMinter = provider.open(JettonMinter.createFromAddress(Address.parse('')));

    await jettonMinter.sendUpgradeContract(provider.sender(), toNano('0.002'), {
        queryId: 0n,
        newCode: await compile('JettonMinter'),
        newData: beginCell()
            .storeCoins(0n)
            .storeAddress(Address.parse(''))
            .storeAddress(Address.parse(''))
            .storeRef(beginCell()
                .storeUint(0x01, 8)
                .storeStringTail('')
                .endCell())
            .storeRef(await compile('JettonWallet'))
            .endCell()
    })
}
