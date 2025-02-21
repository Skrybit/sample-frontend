"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import toaster from "react-hot-toast";
import Wallet, { AddressPurpose, RpcErrorCode } from "sats-connect";

interface WalletContextType {
  address: string;
  ordinalsAddress: string;
  balance: string;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const addressParams = {
  purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
};

const WalletContext = createContext<WalletContextType>({
  address: "",
  ordinalsAddress: "",
  balance: "0",
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

// @TODO: move to utils
const showFullError = (errMsg: string) => {
  console.error(errMsg);
  toaster.error(errMsg);
};

export function WalletProvider({ children }: WalletProviderProps) {
  // @TODO: too many states. add local reducer here
  const [paymentAddress, setPaymentAddress] = useState("");
  const [ordinalsAddress, setOrdinalsAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);

  // @TODO: move to hooks
  const setUserAddresses = useCallback(
    (
      addresses: Array<{
        address: string;
        publicKey: string;
        purpose: AddressPurpose;
      }>,
    ) => {
      const paymentAddressItem = addresses.find(
        (address) => address.purpose === AddressPurpose.Payment,
      );

      console.log("paymentAddressItem", paymentAddressItem);

      const ordinalsAddressItem = addresses.find(
        (address) => address.purpose === AddressPurpose.Ordinals,
      );

      console.log("ordinalsAddressItem", ordinalsAddressItem);

      setPaymentAddress(paymentAddressItem?.address || "");
      setOrdinalsAddress(ordinalsAddressItem?.address || "");
    },
    [],
  );

  // @TODO: move to the hook
  const getAccountBalanceCb = useCallback(async () => {
    const responseBalance = await Wallet.request("getBalance", undefined);

    if (!responseBalance.status || responseBalance.status !== "success") {
      const errMsg =
        "Could not receive user balance: " +
        JSON.stringify(responseBalance.error);
      showFullError(errMsg);
      return;
    }

    setBalance((+responseBalance.result.total / 100000000).toFixed(8)); // Convert satoshis to BTC
  }, []);

  // @TODO: move to the hook
  const getAccountsCb = useCallback(async () => {
    try {
      const response = await Wallet.request("getAddresses", addressParams);

      const { status } = response;

      if (status !== "success") {
        // not connected or no extension available. ignore and return
        return;
      }

      const { result } = response;

      setUserAddresses(result.addresses);
      setIsConnected(true);
      toaster.success("Connected!", { id: "1" });
    } catch (err) {
      const errMsg =
        "Could not receive user accounts: " +
        JSON.stringify((err as Error).message);
      showFullError(errMsg);
    }
  }, []);

  useEffect(() => {
    getAccountsCb();
  }, []);

  useEffect(() => {
    if (isConnected) {
      getAccountBalanceCb();
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    setPaymentAddress("");
    setOrdinalsAddress("");
    setBalance("0");
    setIsConnected(false);

    // @TODO if we want to use last connected wallet we can remove this line
    localStorage.removeItem("sats-connect_defaultProvider");

    // @TODO we can optionally add full disconnect using this method
    // Wallet.request("wallet_disconnect", null);
  }, []);

  const connect = useCallback(async () => {
    try {
      const responseConnect = await Wallet.request(
        "getAccounts",
        addressParams,
      );

      if (!responseConnect.status) {
        const errMsg =
          "Unhandled Error connecting to supported wallet: " +
          JSON.stringify(responseConnect);
        showFullError(errMsg);
        return;
      }

      if (responseConnect.status !== "success") {
        let errMsg = "";

        if (responseConnect.error.code === RpcErrorCode.USER_REJECTION) {
          errMsg = "Error connecting to supported wallet: User rejection. ";
        } else {
          errMsg =
            "Error connecting to supported wallet: Unsupported Error: " +
            JSON.stringify(responseConnect.error);
        }

        showFullError(errMsg);
        return;
      }

      setUserAddresses(responseConnect.result);
      setIsConnected(true);
      toaster.success("Connected!", { id: "2" });
    } catch (err) {
      const errMsg =
        "Could not receive user balance: " +
        JSON.stringify((err as Error).message);
      showFullError(errMsg);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address: paymentAddress,
        ordinalsAddress: ordinalsAddress,
        balance,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
