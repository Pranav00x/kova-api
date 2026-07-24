import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { addressToEmptyAccount, createKernelAccount, constants } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";

const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
const entryPoint = constants.getEntryPoint("0.7");
const KERNEL_V3_1 = constants.KERNEL_V3_1;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

/**
 * Computes the counterfactual ZeroDev Kernel smart account address for a given
 * owner address. Only ever needs the owner's public address — the private key
 * never touches this server, keeping wallet creation non-custodial.
 */
export async function computeSmartAccountAddress(ownerAddress: Address): Promise<Address> {
  const emptyOwner = addressToEmptyAccount(ownerAddress);

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: emptyOwner,
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const account = await createKernelAccount(publicClient, {
    plugins: { sudo: ecdsaValidator },
    entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  return account.address;
}
