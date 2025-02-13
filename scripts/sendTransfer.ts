import { Address, beginCell, toNano } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonWallet = provider.open(JettonWallet.createFromAddress(Address.parse('')));

    await jettonWallet.sendTransfer(provider.sender(), toNano('0.20'), {
        queryId: 0n,
        jettonAmount: toNano('0.000001'),
        toOwnerAddress: Address.parse(''),
        fwdTonAmount: toNano('0.15'),
        forwardPayload: beginCell().storeUint(0, 4).endCell()
    });
}
