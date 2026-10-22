# CampusVoting — Blockchain-Based Voting DApp

**Student:** Shreyan Raghuvanshi

**Registration number:** 230905247

**Assignment:** CSE4444 Blockchain Technology — Assignment 2

**GitHub repository:** https://github.com/gingerale911/CampusBallot

## Submission files

- [Word submission](submission/Shreyan_Raghuvanshi_230905247_BT_Assignment2.docx)
- [PDF for LMS](submission/Shreyan_Raghuvanshi_230905247_BT_Assignment2.pdf)
- [Automated contract tests](tests/contract.cjs)
- [Recorded automated test results](tests/results.json)

## 1. Project Overview

CampusVoting is a decentralised voting application (DApp) designed to provide a transparent, secure, and tamper-resistant voting mechanism for campus elections.

Traditional voting systems may rely on centralised databases and administrators, which can introduce risks such as unauthorised modifications, duplicate voting, and a lack of transparency. CampusVoting addresses these issues by storing election data and enforcing voting rules through a Solidity smart contract deployed on a blockchain.

The application allows an administrator to manage the election and candidates, while voters can connect their cryptocurrency wallets and cast their votes through a web-based interface.

### Key Features

- **Decentralised execution:** Election rules are enforced by a deployed smart contract.
- **Access control:** Administrative operations are restricted to the administrator account that deployed the contract.
- **One vote per address:** A voter cannot cast multiple votes using the same wallet address.
- **Candidate management:** The administrator can add candidates before voting begins.
- **Election lifecycle management:** The administrator can start and end the voting process.
- **Input validation:** Invalid candidate selections and disallowed operations are rejected by the smart contract.
- **Blockchain transparency:** Candidate information, vote counts, and election status can be retrieved through the frontend.
- **MetaMask integration:** Users interact with the smart contract using their connected wallets.

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| Solidity 0.8.24 | Smart contract development |
| Remix IDE | Smart contract compilation, deployment, and testing |
| Ganache 2.7.1 | Local Ethereum blockchain |
| MetaMask | Wallet connection and transaction signing |
| Ethers.js | Communication between the frontend and smart contract |
| HTML, CSS, JavaScript | User interface and application logic |

## 3. Prerequisites

Before running the application, ensure that the following are installed and configured:

1. [Ganache](https://archive.trufflesuite.com/ganache/) — for running the local blockchain.
2. [MetaMask](https://metamask.io/) — browser wallet for signing transactions.
3. [Remix IDE](https://remix.ethereum.org/) — for compiling and deploying the Solidity contract.
4. A web browser with MetaMask enabled.
5. A local web server, such as the VS Code Live Server extension, for serving the frontend.

## 4. Steps to Execute the Application

### Step 1: Start the Local Blockchain

1. Open Ganache.
2. Start a workspace or local blockchain.
3. Verify that the RPC server is running at:

   `http://127.0.0.1:7545`

4. Verify that the network uses Chain ID `1337`.
5. Keep Ganache running throughout the application session.

Ganache provides pre-funded development accounts for testing transactions without using real cryptocurrency.

### Step 2: Compile the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Open or import the `CampusVoting.sol` smart contract.
3. Navigate to the Solidity Compiler panel.
4. Select compiler version `0.8.24`.
5. Set the EVM version to `Paris`, if required for compatibility with the local environment.
6. Compile the contract.
7. Verify that compilation completes successfully.

### Step 3: Deploy the Smart Contract

1. Navigate to **Deploy & Run Transactions** in Remix.
2. Select the environment connected to your Ganache RPC endpoint.
3. Select the `CampusVoting` contract.
4. Enter a non-empty election name in the constructor arguments.
5. Click **Deploy**.
6. Confirm that the deployment transaction succeeds.
7. Copy the deployed contract address from Remix.

The account used for deployment becomes the administrator of the election. Administrative privileges are enforced by the smart contract.

### Step 4: Configure the Frontend

1. Open the frontend source code.
2. Locate the contract address configuration.
3. Replace the existing address with the address of the newly deployed contract.
4. Ensure that the contract ABI corresponds to the deployed version of `CampusVoting`.
5. Verify that the frontend connects to the correct local network through MetaMask.

If the contract is redeployed, update the frontend with the new address.

### Step 5: Run the Frontend

1. Open the project folder in Visual Studio Code.
2. Start the frontend using the Live Server extension, or the local server configured for the project.
3. Open the URL provided by the server in your browser.
4. Verify that the CampusVoting interface loads correctly.

If the project uses a different frontend setup, follow its configured start command instead.

## 5. Connecting MetaMask

### Step 1: Configure the Ganache Network

Add the following network to MetaMask if it is not already configured:

| Setting | Value |
|---|---|
| Network Name | Ganache Local |
| RPC URL | `http://127.0.0.1:7545` |
| Chain ID | `1337` |
| Currency Symbol | ETH |

The network name is user-defined; the RPC URL and Chain ID must match Ganache.

### Step 2: Import a Ganache Account

1. Open Ganache and select an available development account.
2. Copy its private key.
3. In MetaMask, import the account using the private key.
4. Repeat with other Ganache accounts when testing different voter identities.

**Security note:** Use only disposable local development accounts. Never import a real wallet's private key into a development environment or publish private keys in this repository.

### Step 3: Connect the Wallet

1. Open the CampusVoting frontend.
2. Click the **Connect Wallet** button.
3. Approve the connection request in MetaMask.
4. Verify that the connected account address is displayed in the UI.
5. Confirm that MetaMask is connected to the Ganache network.

### Step 4: Interact with the Smart Contract

**Administrator operations**

Using the account that deployed the contract:

1. Add candidates with valid names.
2. Start the election when the required candidates have been added.
3. Monitor election status and candidate vote counts.
4. End the election when voting is complete.

**Voter operations**

Using a different Ganache account:

1. Connect the voter wallet.
2. View the available candidates.
3. Select a candidate and cast a vote.
4. Approve the transaction in MetaMask.
5. Wait for transaction confirmation.
6. Verify that the candidate's vote count is updated.
7. Attempt a second vote to verify duplicate-voting protection.

The frontend provides the user interface, while the deployed smart contract is responsible for enforcing the election rules.

## 6. Deployment Details

The application is deployed on a local Ganache blockchain for development and testing.

| Parameter | Value |
|---|---|
| Blockchain Network | Ganache Local |
| Ganache Version | 2.7.1 |
| Chain ID | `1337` |
| RPC Endpoint | `http://127.0.0.1:7545` |
| Smart Contract Name | `CampusVoting` |
| Solidity Compiler | `0.8.24` |
| EVM Version | `Paris` |
| Contract address configured in `frontend/app.js` | `0xFeADdC1E9B780bd0fc4a2a82eBA8A0CA1BAA4121` |
| Administrator address | Read from `admin()` on the deployment |

The address above is the address recorded in the project configuration for Ganache Local; it is not a public-network deployment. A Ganache workspace is local to the machine and may not contain this contract. After a fresh Remix deployment, update `CONTRACT_ADDRESS` in `frontend/app.js` with the new address and verify it using `eth_getCode` or the frontend. A new deployment creates a new address and fresh contract state.

## 7. Test Cases and Results

The following test cases evaluate valid inputs, invalid inputs, access-control restrictions, duplicate voting, and election lifecycle validation in the CampusVoting DApp.

### 7.1 Valid Input Test Cases

| Test ID | Test Scenario | Input / Action | Expected Result | Observed Result |
|---|---|---|---|---|
| TC01 | Add a valid candidate | Candidate name: Alice | Candidate is added successfully. | Candidate was added successfully. |
| TC02 | Add another valid candidate | Candidate name: Bob | Candidate is added successfully. | Candidate was added successfully. |
| TC05 | Start the election | Administrator starts the election. | Election status changes to Active. | Election status changed to Active. |
| TC06 | Cast a valid vote | Voter votes for Alice using a valid candidate ID. | Transaction succeeds and Alice's vote count increases. | Transaction succeeded and Alice's vote count increased. |
| TC09 | Vote using another wallet | A different voter votes for Bob. | Transaction succeeds and Bob's vote count increases. | Transaction succeeded and Bob's vote count increased. |
| TC11 | End the election | Administrator ends the election. | Election status changes to Ended. | Election status changed to Ended. |

### 7.2 Invalid Input Test Cases

| Test ID | Test Scenario | Input / Action | Expected Result | Observed Result |
|---|---|---|---|---|
| TC03 | Add a candidate with an empty name | Empty string as candidate name. | Operation is rejected by the smart contract. | Operation was rejected by the smart contract. |
| TC08 | Vote for an invalid candidate | Candidate ID outside the valid range. | Transaction reverts and vote counts remain unchanged. | Transaction reverted and vote counts remained unchanged. |
| TC12 | Vote after the election ends | A voter attempts to vote after the election has ended. | Transaction reverts and no vote is recorded. | Transaction reverted and no vote was recorded. |

### 7.3 Unauthorised Input Test Cases

| Test ID | Test Scenario | Input / Action | Expected Result | Observed Result |
|---|---|---|---|---|
| TC04 | Unauthorised candidate addition | A non-admin account calls `addCandidate` directly through Remix. | Smart contract rejects the call through its access-control check. | Smart contract rejected the call through its access-control check. |
| TC10 | Unauthorised election termination | A non-admin account calls `endVoting` directly through Remix. | Smart contract rejects the call through its access-control check. | Smart contract rejected the call through its access-control check. |

### 7.4 Duplicate Voting Test Case

| Test ID | Test Scenario | Input / Action | Expected Result | Observed Result |
|---|---|---|---|---|
| TC07 | Attempt to vote twice | The same wallet calls `vote` a second time after successfully voting once. | Smart contract rejects the second vote and the candidate's vote count remains unchanged. | Smart contract rejected the second vote and the candidate's vote count remained unchanged. |

### Test Execution Notes

- TC04, TC07, and TC10 should be tested directly through Remix to verify that the smart contract enforces the restrictions independently of the frontend.
- Verify candidate counts and election status before and after each relevant operation.
- Invalid inputs and unauthorised operations must be rejected by the smart contract, not merely hidden or disabled by the UI.
- Record the actual revert messages and transaction details when executing the tests.
- The repository also includes reproducible automated tests: run `npm install` and `npm test`. The test run compiles the contract and executes 22 checks, including valid transactions, invalid inputs, and unauthorized calls against an isolated in-memory Ganache chain. The generated receipts and results are in `tests/results.json`. This automated run is separate from the Remix/MetaMask screenshots below and does not prove that a persistent Ganache workspace contains the configured address.

## 8. Screenshots and Evidence

The screenshots below document smart contract compilation and deployment, MetaMask connection, successful and failed transactions, and blockchain data displayed by the frontend.

### 8.1 Smart Contract Compilation

**Description:** Successful compilation of the `CampusVoting` smart contract using Solidity compiler version `0.8.24`.

**Screenshot:**

<img width="954" height="438" alt="Screenshot 2026-10-17 201612" src="https://github.com/user-attachments/assets/794f2aaa-f10a-4f10-aecf-f1bdbc7a1588" />




### 8.2 Smart Contract Deployment

**Description:** Successful deployment of the smart contract to the local Ganache blockchain, showing the deployed contract address.

**Screenshot:**

<img width="955" height="442" alt="Screenshot 2026-10-17 201714" src="https://github.com/user-attachments/assets/ea70837c-c984-40db-b95b-7d636e2956b2" />




### 8.3 MetaMask Wallet Connection

**Description:** CampusVoting frontend connected to a MetaMask account on the Ganache network.

**Screenshot:**

<img width="946" height="468" alt="Screenshot 2026-10-17 184318" src="https://github.com/user-attachments/assets/86cc484e-6523-4405-aec6-f5ee95d4f110" />
<img width="946" height="466" alt="Screenshot 2026-10-17 184341" src="https://github.com/user-attachments/assets/d64da6e7-e75c-4ae5-ab6b-000b6b8c9022" />




### 8.4 Successful Transaction

**Description:** A successful voting transaction showing transaction confirmation and the updated candidate vote count.

**Screenshot:**

<img width="958" height="466" alt="Screenshot 2026-10-17 193026" src="https://github.com/user-attachments/assets/3eb1736c-42eb-45d9-860a-1f11adef0d81" />
<img width="949" height="476" alt="image" src="https://github.com/user-attachments/assets/25ed3d8a-0ac5-49c5-bd22-bbb2d1f517d7" />
<img width="632" height="320" alt="Screenshot 2026-10-17 193238" src="https://github.com/user-attachments/assets/8568acb7-9fec-423f-a019-91772660a005" />
<img width="950" height="466" alt="Screenshot 2026-10-17 210050" src="https://github.com/user-attachments/assets/990765d5-781c-4855-84ad-b0552de748a0" />
<img width="956" height="469" alt="Screenshot 2026-10-17 210251" src="https://github.com/user-attachments/assets/8e32fa42-d850-4004-a7fb-2b98ab06203e" />
<img width="941" height="461" alt="Screenshot 2026-10-17 200848" src="https://github.com/user-attachments/assets/d9b50544-cc77-4e30-8d6d-4a0144f2bae8" />
<img width="956" height="471" alt="Screenshot 2026-10-17 200911" src="https://github.com/user-attachments/assets/637b6505-de2c-4d1d-9c5e-cf10e4e73eb1" />
<img width="949" height="470" alt="Screenshot 2026-10-17 200933" src="https://github.com/user-attachments/assets/022c348e-b164-42b7-b426-b4e7785774f9" />








### 8.5 Failed Transaction

**Description:** A rejected transaction, such as an unauthorised candidate addition or a duplicate voting attempt, demonstrating smart contract validation.

**Screenshot:**

Student starting an election:
<img width="942" height="461" alt="Screenshot 2026-10-17 195150" src="https://github.com/user-attachments/assets/1e9b63c7-65e0-4801-9166-7de9a3c8a1f5" />


Re-vote by the same voter:
<img width="943" height="472" alt="Screenshot 2026-10-17 195746" src="https://github.com/user-attachments/assets/cfb8a34c-6199-4a1a-bc5d-cdc549e28d17" />


### 8.6 Blockchain Data Displayed Through the User Interface

**Description:** The frontend displaying candidate information, vote counts, election status, and connected wallet information retrieved from the deployed smart contract.

**Screenshot:**

<img width="629" height="385" alt="Screenshot 2026-10-17 193058" src="https://github.com/user-attachments/assets/c69ef7ea-359c-4ed0-869e-98eeeccf800f" />
<img width="803" height="391" alt="Screenshot 2026-10-17 193158" src="https://github.com/user-attachments/assets/e8c3467c-5cad-42ac-af0d-af8c53b6578a" />
<img width="596" height="380" alt="Screenshot 2026-10-17 195239" src="https://github.com/user-attachments/assets/be7b4b73-1270-4269-89dc-7e5673ceec36" />
<img width="622" height="294" alt="Screenshot 2026-10-17 195840" src="https://github.com/user-attachments/assets/f16d6d50-28ef-4913-97c9-6b8fd02294c0" />
<img width="611" height="376" alt="Screenshot 2026-10-17 200942" src="https://github.com/user-attachments/assets/3a2602b5-c102-4dc4-8cab-61fcbc316e6e" />







## 9. Security and Validation

CampusVoting relies on smart contract validation to protect the integrity of the election.

- **Administrator access control:** Administrative operations are restricted to the deployer's address.
- **Duplicate-vote prevention:** The contract prevents a wallet address from voting more than once.
- **Election state validation:** Voting is restricted according to the election's lifecycle.
- **Candidate validation:** Invalid candidate selections must be rejected.
- **Frontend-independent enforcement:** Contract restrictions should remain effective even when functions are called directly through Remix rather than through the frontend.

The frontend improves usability, but it must not be treated as the security boundary. Security-sensitive rules must be enforced by the deployed smart contract.

## 10. Limitations

- The application is currently tested on a local Ganache blockchain rather than a public production network.
- Ganache development accounts and their balances are intended for local testing.
- Blockchain transactions may require confirmation before updated state is displayed.
- The one-vote-per-address mechanism prevents repeated voting from the same wallet address, but it does not prove that each real-world person owns only one address.
- The integrity of voting results depends on correct smart contract implementation and deployment.

## 11. Conclusion

CampusVoting demonstrates how blockchain technology can be used to implement a transparent and rule-enforced voting application. The Solidity smart contract manages candidate registration, administrator permissions, voting eligibility, duplicate-vote prevention, and election status.

By combining Remix IDE, Ganache, MetaMask, Ethers.js, and a web-based frontend, the project provides a practical demonstration of blockchain-based application development and smart contract testing.
