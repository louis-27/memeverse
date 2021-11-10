import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import theMemeverse from "./utils/TheMemeverse.json";
import StarParticles from "./components/StarParticles";
import SelectCharacter from "./components/SelectCharacter";
import Arena from "./components/Arena";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];

        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Request access to MetaMask account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /**
       * Print public address once Metamask is authorized.
       */
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://media3.giphy.com/media/ToMjGpzot8uTh5nUwnu/200w.webp?cid=ecf05e47el8efm9028v92ik61yq104e2wwmw0t7rmhvnm4q6&rid=200w.webp&ct=g"
            alt="Dog Welcoming Gif"
          />

          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet to Enter
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    /**
     * Interact with smart contract
     */
    const fetchNFTMetadata = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        theMemeverse.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found!");
      }
    };

    /**
     * Run function if wallet is connected
     */
    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <StarParticles />
        <div className="header-container">
          <p className="header gradient-text">Memeverse</p>
          <p className="sub-text">Enter and fight foes of the Memeverse</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
