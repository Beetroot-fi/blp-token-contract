import { Address, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonMinter = provider.open(JettonMinter.createFromAddress(Address.parse('')));

    await jettonMinter.sendChangeTGBTCJettonWallet(provider.sender(), toNano('0.002'), {
        queryId: 0n,
        newTGBTCJettonWallet: Address.parseRaw('')
    });
}
