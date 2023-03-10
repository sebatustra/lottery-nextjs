import {useWeb3Contract} from "react-moralis"
import {abi, contractAddresses} from "../constants/index";
import {useMoralis} from "react-moralis";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {useNotification } from "web3uikit";

export default function LotteryEntrance() {
    const {chainId: chainIdHex, isWeb3Enabled} = useMoralis();
    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;
    const [entranceFee, setEntranceFee] = useState("0");
    const [numberOfPlayers, setNumberOfPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const dispatch = useNotification();

    const {runContractFunction: enterRaffle, isLoading, isFetching} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,

    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        setEntranceFee(entranceFeeFromCall);
        const numberOfPlayersFromCall = (await getNumPlayers())
        setNumberOfPlayers( numberOfPlayersFromCall)
        const recentWinnerFromCall = (await getRecentWinner())
        setRecentWinner(recentWinnerFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled && raffleAddress) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async function (tx) {
        try {
            await tx.wait(1);
            handleNewNotification(tx);
            updateUI();
        }catch(e) {
            console.log(e)
        }
    }

    const handleNewNotification = function() {
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
        })
    }

    return(
        <div className="p-5">
            {raffleAddress
                ?
                <div>
                <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    onClick={async function(){
                        await enterRaffle({
                            onSuccess: handleSuccess,
                            onError: (e) => console.log(e)
                        })
                    }}
                        disabled={isLoading || isFetching}
                >
                        {isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div> : <div>Enter Raffle</div>}
                </button>
                <div>
                        Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                </div>
                <div>
                        Number of players: {numberOfPlayers.toString()}
                </div>
                <div>
                        Recent Winner: {recentWinner}
                </div>

                </div>
                :
                <div>
                    No raffle address detected
                </div>
            }

        </div>
    )
}
