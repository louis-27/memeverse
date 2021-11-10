import { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import theMemeverse from "../../utils/TheMemeverse.json";
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);

        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();

        setMintingCharacter(false);
      }
    } catch (error) {
      console.error("MintCharacterAction Error:", error);
      setMintingCharacter(false);
    }
  };

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        theMemeverse.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("Make sure you have MetaMask.");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        /**
         * Call contract to get mint-able characters
         */
        const charactersTxn = await gameContract.getAllDefaultCharacters();

        /**
         * Go through all characters and transform the data
         */
        const characters = charactersTxn.map((characterData) => {
          return transformCharacterData(characterData);
        });

        setCharacters(characters);
      } catch (error) {
        console.log("Error fetching characters:", error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      alert(
        `NFT Successfully Minted. View it on Opensea: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`
      );

      /**
       * Fetch metadata from contractand set to characterNFT state
       */
      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();

      /**
       * NFT Minted Listener
       */
      gameContract.on("CharacterNFTMinted", onCharacterMint);
    }

    return () => {
      /**
       * Clean up the listener when component unmounts
       */
      if (gameContract) {
        gameContract.off("CharacterNFTMinted", onCharacterMint);
      }
    };
  }, [gameContract, setCharacterNFT]);

  const renderCharacters = () => {
    return characters.map((character, index) => {
      return (
        <div className="character-item" key={character.name}>
          <div className="name-container">
            <p>{character.name}</p>
          </div>
          <img
            src={character.imageURI}
            // src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`}
            alt={character.name}
          />
          <button
            type="button"
            className="character-mint-button"
            onClick={mintCharacterNFTAction(index)}
          >{`Mint ${character.name}`}</button>
        </div>
      );
    });
  };

  return (
    <div className="select-character-container">
      <h2>Choose a character to mint.</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting in Progress...</p>
          </div>
          <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          />
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
