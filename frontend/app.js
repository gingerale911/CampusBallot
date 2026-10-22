/*
 * Campus Voting DApp — Frontend
 */

const CONTRACT_ADDRESS = "0xFeADdC1E9B780bd0fc4a2a82eBA8A0CA1BAA4121";

const ABI = [
    "function admin() view returns (address)",
    "function electionName() view returns (string)",
    "function votingOpen() view returns (bool)",
    "function electionEnded() view returns (bool)",
    "function candidateCount() view returns (uint256)",
    "function hasVoted(address) view returns (bool)",

    "function getCandidate(uint256) view returns (string name, string manifesto, uint256 voteCount)",
    "function addCandidate(string,string)",
    "function startVoting()",
    "function vote(uint256)",
    "function endVoting()",

    "event CandidateAdded(uint256 indexed candidateId, string name)",
    "event VotingStarted()",
    "event VoteCast(address indexed voter, uint256 indexed candidateId)",
    "event VotingEnded()"
];

let provider;
let signer;
let contract;
let account;

const $ = (id) => document.getElementById(id);

function showMessage(message) {
    $("message").textContent = message;
}

// Display confirmed blockchain transaction details.
function showTransactionDetails(tx, receipt, action) {
    const container = $("transactionData");

    if (!container) {
        console.warn(
            'Add <div id="transactionData"></div> inside Transaction activity.'
        );
        return;
    }

    container.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Latest confirmed transaction";
    container.appendChild(heading);

    const fields = [
        ["Action", action],
        [
            "Status",
            Number(receipt.status) === 1 ? "Confirmed" : "Failed"
        ],
        ["Transaction hash", receipt.hash || tx.hash],
        ["Block number", receipt.blockNumber],
        ["From", receipt.from || tx.from],
        ["To (contract)", receipt.to || tx.to],
        ["Gas used", receipt.gasUsed?.toString() ?? "Unavailable"]
    ];

    for (const [label, value] of fields) {
        const row = document.createElement("p");
        row.className = "activity-detail";

        const strong = document.createElement("strong");
        strong.textContent = label + ": ";

        const span = document.createElement("span");
        span.textContent =
            value == null ? "Unavailable" : String(value);

        row.append(strong, span);
        container.appendChild(row);
    }

    const eventsHeading = document.createElement("h4");
    eventsHeading.textContent = "Contract events";
    container.appendChild(eventsHeading);

    let foundEvent = false;

    for (const log of receipt.logs ?? []) {
        try {
            const parsed = contract.interface.parseLog(log);

            if (!parsed) continue;

            const event = document.createElement("p");
            event.className = "activity-detail";
            event.textContent =
                parsed.name +
                ": " +
                Array.from(parsed.args).map(String).join(", ");

            container.appendChild(event);
            foundEvent = true;
        } catch {
            // Ignore logs that do not match this contract's ABI.
        }
    }

    if (!foundEvent) {
        const empty = document.createElement("p");
        empty.textContent = "No matching contract events found.";
        container.appendChild(empty);
    }
}

// Handle MetaMask, RPC and Solidity errors.
function handleError(error) {
    console.error("Full transaction error:", error);

    const messages = [];
    const seen = new Set();

    function collect(value, depth = 0) {
        if (depth > 5 || value == null) return;

        if (typeof value === "string") {
            if (!seen.has(value)) {
                seen.add(value);
                messages.push(value);
            }
            return;
        }

        if (typeof value === "object") {
            for (const key of [
                "reason",
                "message",
                "shortMessage",
                "data",
                "error",
                "info",
                "revert"
            ]) {
                if (key in value) {
                    collect(value[key], depth + 1);
                }
            }
        }
    }

    collect(error);

    const combined = messages.join("\n");

    if (error?.code === 4001) {
        showMessage("Transaction cancelled in MetaMask.");
        return;
    }

    const knownErrors = [
        [
            "Only admin can call this",
            "Access denied: Only admin can call this."
        ],
        [
            "Candidate name required",
            "Candidate name cannot be empty."
        ],
        [
            "Add at least two candidates",
            "Voting cannot start until at least two candidates are added."
        ],
        [
            "Voting is already open",
            "Voting is already open."
        ],
        [
            "Voting is not open",
            "Voting is not open."
        ],
        [
            "Election has ended",
            "The election has ended."
        ],
        [
            "Invalid candidate",
            "Invalid candidate ID."
        ],
        [
            "Wallet has already voted",
            "This wallet has already voted."
        ],
        [
            "Candidate name too long",
            "Candidate name exceeds the allowed length."
        ],
        [
            "Manifesto too long",
            "Manifesto exceeds the allowed length."
        ]
    ];

    for (const [reason, friendlyMessage] of knownErrors) {
        if (
            combined.toLowerCase().includes(reason.toLowerCase())
        ) {
            showMessage("Transaction reverted: " + friendlyMessage);
            return;
        }
    }

    showMessage(
        "Transaction failed: " +
        (
            messages.find((message) =>
                /missing revert data|internal json-rpc error/i.test(message)
            ) ||
            messages[0] ||
            "Unknown error. Check the browser Console."
        )
    );
}

// Connect MetaMask to the deployed contract.
async function connectWallet() {
    const button = $("connectBtn");

    try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask first.");
        }

        button.disabled = true;
        button.textContent = "Connecting...";

        if (
            CONTRACT_ADDRESS ===
            "PASTE_YOUR_GANACHE_CONTRACT_ADDRESS_HERE"
        ) {
            throw new Error(
                "Set the deployed contract address in app.js."
            );
        }

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        if (!accounts.length) {
            throw new Error("No wallet account was selected.");
        }

        const chainId = await window.ethereum.request({
            method: "eth_chainId"
        });

        if (chainId !== "0x539") {
            throw new Error(
                "Please switch MetaMask to Ganache Local (Chain ID 1337)."
            );
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        account = await signer.getAddress();

        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        );

        const code = await provider.getCode(CONTRACT_ADDRESS);

        if (code === "0x") {
            throw new Error(
                "No contract found at this address on Ganache. Check CONTRACT_ADDRESS."
            );
        }

        button.textContent =
            account.slice(0, 6) + "..." + account.slice(-4);

        $("accountDisplay").textContent = "Wallet: " + account;

        showMessage("Wallet connected. Loading election data...");

        await refreshData();

        showMessage("Wallet connected successfully.");
    } catch (error) {
        handleError(error);
        button.textContent = "Connect Wallet";
    } finally {
        button.disabled = false;
    }
}

// Read the current election state from the blockchain.
async function refreshData() {
    if (!contract || !account) {
        showMessage("Connect MetaMask first.");
        return;
    }

    try {
        const [
            name,
            admin,
            isOpen,
            hasEnded,
            count,
            alreadyVoted
        ] = await Promise.all([
            contract.electionName(),
            contract.admin(),
            contract.votingOpen(),
            contract.electionEnded(),
            contract.candidateCount(),
            contract.hasVoted(account)
        ]);

        $("electionName").textContent = name;

        if (hasEnded) {
            $("electionStatus").textContent = "Election ended";
        } else if (isOpen) {
            $("electionStatus").textContent = "Voting open";
        } else {
            $("electionStatus").textContent = "Not started";
        }

        // Keep admin controls visible for unauthorized-access testing.
        // Solidity's onlyAdmin modifier remains the actual security guard.
        $("adminPanel").classList.remove("hidden");

        $("startBtn").disabled = false;
        $("endBtn").disabled = false;

        $("candidateForm").querySelector(
            "button[type='submit']"
        ).disabled = false;

        const list = $("candidateList");
        list.replaceChildren();

        if (Number(count) === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No candidates have been added yet.";
            list.appendChild(empty);
            return;
        }

        for (let i = 0; i < Number(count); i++) {
            const candidate = await contract.getCandidate(i);

            const card = document.createElement("article");
            card.className = "candidate-card";

            const title = document.createElement("h3");
            title.textContent = candidate.name;

            const manifesto = document.createElement("p");
            manifesto.textContent = candidate.manifesto;

            const votes = document.createElement("p");
            votes.className = "vote-count";
            votes.textContent =
                "Votes: " + candidate.voteCount.toString();

            const button = document.createElement("button");

            button.textContent = "Vote for candidate";
            button.disabled = !isOpen;

            button.addEventListener("click", async () => {
                try {
                    showMessage(
                        "Please confirm your vote in MetaMask."
                    );

                    const tx = await contract.vote(i);

                    showMessage(
                        "Transaction submitted: " + tx.hash
                    );

                    const receipt = await tx.wait();

                    showTransactionDetails(
                        tx,
                        receipt,
                        "Cast vote"
                    );

                    showMessage("Vote recorded successfully.");

                    await refreshData();
                } catch (error) {
                    handleError(error);
                }
            });

            card.append(title, manifesto, votes, button);
            list.appendChild(card);
            await showElectionWinner();
        }
    } catch (error) {
        handleError(error);
    }
}

async function showElectionWinner() {
    const section = $("winnerSection");
    const message = $("winnerMessage");
    const results = $("finalResults");

    if (!contract) return;

    const ended = await contract.electionEnded();

    if (!ended) {
        section.classList.add("hidden");
        return;
    }

    const count = Number(await contract.candidateCount());

    if (count === 0) {
        message.textContent = "The election ended with no candidates.";
        results.replaceChildren();
        section.classList.remove("hidden");
        return;
    }

    const candidates = [];

    for (let i = 0; i < count; i++) {
        const candidate = await contract.getCandidate(i);

        candidates.push({
            name: candidate.name,
            votes: BigInt(candidate.voteCount)
        });
    }

    results.replaceChildren();

    for (const candidate of candidates) {
        const row = document.createElement("p");
        row.textContent =
            `${candidate.name}: ${candidate.votes.toString()} votes`;
        results.appendChild(row);
    }

    const highestVotes = candidates.reduce(
        (max, candidate) =>
            candidate.votes > max ? candidate.votes : max,
        0n
    );

    const winners = candidates.filter(
        candidate => candidate.votes === highestVotes
    );

    if (winners.length > 1) {
        message.textContent =
            `It's a tie! ${winners.map(c => c.name).join(" and ")} ` +
            `each received ${highestVotes.toString()} votes.`;
    } else {
        message.textContent =
            `🏆 Winner: ${winners[0].name} with ` +
            `${highestVotes.toString()} votes!`;
    }

    section.classList.remove("hidden");
}

// Add a candidate.
$("candidateForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contract) {
        showMessage("Connect MetaMask first.");
        return;
    }

    const name = $("candidateName").value.trim();
    const manifesto = $("manifesto").value.trim();

    try {
        showMessage(
            "Confirm candidate registration in MetaMask."
        );

        const tx = await contract.addCandidate(name, manifesto);
        const receipt = await tx.wait();

        showTransactionDetails(
            tx,
            receipt,
            "Add candidate"
        );

        $("candidateForm").reset();

        showMessage("Candidate added successfully.");

        await refreshData();
    } catch (error) {
        handleError(error);
    }
});

// Start voting.
$("startBtn").addEventListener("click", async () => {
    if (!contract) {
        showMessage("Connect MetaMask first.");
        return;
    }

    try {
        showMessage(
            "Confirm start-voting transaction in MetaMask."
        );

        const tx = await contract.startVoting();
        const receipt = await tx.wait();

        showTransactionDetails(
            tx,
            receipt,
            "Start voting"
        );

        showMessage("Voting is now open.");

        await refreshData();
    } catch (error) {
        handleError(error);
    }
});

// End voting permanently.
$("endBtn").addEventListener("click", async () => {
    if (!contract) {
        showMessage("Connect MetaMask first.");
        return;
    }

    if (!confirm("End the election permanently?")) {
        return;
    }

    try {
        showMessage(
            "Confirm end-election transaction in MetaMask."
        );

        const tx = await contract.endVoting();
        const receipt = await tx.wait();

        showTransactionDetails(
            tx,
            receipt,
            "End voting"
        );

        showMessage("Election ended.");

        await refreshData();
    } catch (error) {
        handleError(error);
    }
});

// Connect and refresh buttons.
$("connectBtn").addEventListener("click", async () => {
    await connectWallet();
});

$("refreshBtn").addEventListener("click", refreshData);

// Reload if the user switches MetaMask account or network.
if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => location.reload());
    window.ethereum.on("chainChanged", () => location.reload());
}