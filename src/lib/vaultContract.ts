import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";

const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";
const VAULT_ADDRESS = process.env.KOVA_VAULT_ADDRESS as Address | undefined;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const kovaVaultAbi = [
  { type: "function", name: "totalAssets", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalShares", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sharePrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "shares",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export interface VaultStats {
  deployed: boolean;
  totalAssets: string;
  totalShares: string;
  sharePrice: string;
}

export async function getVaultStats(): Promise<VaultStats> {
  if (!VAULT_ADDRESS) {
    return { deployed: false, totalAssets: "0", totalShares: "0", sharePrice: "0" };
  }

  const [totalAssets, totalShares, sharePrice] = await Promise.all([
    publicClient.readContract({ address: VAULT_ADDRESS, abi: kovaVaultAbi, functionName: "totalAssets" }),
    publicClient.readContract({ address: VAULT_ADDRESS, abi: kovaVaultAbi, functionName: "totalShares" }),
    publicClient.readContract({ address: VAULT_ADDRESS, abi: kovaVaultAbi, functionName: "sharePrice" }),
  ]);

  return {
    deployed: true,
    totalAssets: totalAssets.toString(),
    totalShares: totalShares.toString(),
    sharePrice: sharePrice.toString(),
  };
}

export async function getUserVaultShares(ownerAddress: Address): Promise<string> {
  if (!VAULT_ADDRESS) return "0";
  const shares = await publicClient.readContract({
    address: VAULT_ADDRESS,
    abi: kovaVaultAbi,
    functionName: "shares",
    args: [ownerAddress],
  });
  return shares.toString();
}
