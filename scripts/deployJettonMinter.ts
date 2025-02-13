import { Address, beginCell, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jettonMinter = provider.open(JettonMinter.createFromConfig({
        totalSupply: 0n,
        adminAddress: Address.parse(''),
        tgBTCJettonWalletAddress: Address.parse(''),
        content: beginCell()
            .storeUint(0x01, 8)
            .storeStringTail('')
            .endCell(),
        jettonWalletCode: await compile('Jettonwallet')
    }, await compile('JettonMinter')));

    await jettonMinter.sendDeploy(provider.sender(), toNano('0.002'));

    await provider.waitForDeploy(jettonMinter.address);
}
