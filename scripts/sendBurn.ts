import { Address, beginCell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonWallet = provider.open(JettonWallet.createFromAddress(Address.parse('')));

    await jettonWallet.sendBurn(provider.sender(), toNano('0.05'), {
        queryId: 0n,
        amount: 1000n,
        responseAddress: Address.parse(''),
    });
}
