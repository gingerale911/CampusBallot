const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const solc = require('solc');
const ganache = require('ganache');
const { ethers } = require('ethers');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '../contracts/CampusVoting.sol'), 'utf8');
  const output = JSON.parse(solc.compile(JSON.stringify({language:'Solidity', sources:{'CampusVoting.sol':{content:source}}, settings:{evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
  const errors = (output.errors || []).filter(e => e.severity === 'error');
  assert.equal(errors.length, 0, JSON.stringify(errors));
  const artifact = output.contracts['CampusVoting.sol'].CampusVoting;
  const rpc = ganache.provider({logging:{quiet:true},chain:{chainId:1337},wallet:{totalAccounts:4}});
  const provider = new ethers.BrowserProvider(rpc);
  provider.pollingInterval = 10;
  const admin = await provider.getSigner(0), voter = await provider.getSigner(1), other = await provider.getSigner(2);
  const factory = new ethers.ContractFactory(artifact.abi, artifact.evm.bytecode.object, admin);
  const results = [];
  async function test(name, fn) { await fn(); results.push({name,result:'PASS'}); console.log('PASS '+name); }
  async function rejects(action, reason) {
    try { await action(); assert.fail('Expected revert'); }
    catch (e) { assert.ok(JSON.stringify(e, (k,v)=>typeof v==='bigint'?String(v):v).includes(reason), 'Missing revert reason '+reason); }
  }
  await test('Reject empty election name',()=>rejects(()=>factory.deploy(''),'Election name required'));
  const c = await factory.deploy('Campus Council Election'); await c.waitForDeployment();
  const receipts = [];
  async function tx(action) { const receipt = await (await action()).wait(); assert.equal(receipt.status,1); receipts.push({hash:receipt.hash,blockNumber:receipt.blockNumber,status:receipt.status}); }
  await test('Constructor sets administrator and election name',async()=>{assert.equal(await c.admin(),await admin.getAddress());assert.equal(await c.electionName(),'Campus Council Election');});
  await test('Reject start with fewer than two candidates',()=>rejects(()=>c.startVoting.staticCall(),'Add at least two candidates'));
  await test('Reject empty candidate name',()=>rejects(()=>c.addCandidate.staticCall('',''),'Candidate name required'));
  await test('Reject overlong name',()=>rejects(()=>c.addCandidate.staticCall('a'.repeat(81),''),'Candidate name too long'));
  await test('Reject overlong manifesto',()=>rejects(()=>c.addCandidate.staticCall('Obijit Singh','a'.repeat(501)),'Manifesto too long'));
  await test('Reject unauthorized candidate addition',()=>rejects(()=>c.connect(voter).addCandidate.staticCall('Obijit Singh',''),'Only admin can call this'));
  await test('Add Obijit Singh and Safin Joash and retrieve data',async()=>{await tx(()=>c.addCandidate('Obijit Singh','Library access'));await tx(()=>c.addCandidate('Safin Joash','Student clubs'));assert.equal(await c.candidateCount(),2n);assert.equal((await c.getCandidate(0)).name,'Obijit Singh');});
  await test('Reject vote before opening',()=>rejects(()=>c.connect(voter).vote.staticCall(0),'Voting is not open'));
  await test('Reject unauthorized start',()=>rejects(()=>c.connect(voter).startVoting.staticCall(),'Only admin can call this'));
  await test('Start election',async()=>{await tx(()=>c.startVoting());assert.equal(await c.votingOpen(),true);});
  await test('Reject repeated start',()=>rejects(()=>c.startVoting.staticCall(),'Voting is already open'));
  await test('Reject candidate addition during voting',()=>rejects(()=>c.addCandidate.staticCall('Carol',''),'Voting is already open'));
  await test('Reject invalid candidate vote and read',async()=>{await rejects(()=>c.connect(voter).vote.staticCall(99),'Invalid candidate');await rejects(()=>c.getCandidate(99),'Invalid candidate');});
  await test('Record valid vote and voter state',async()=>{await tx(()=>c.connect(voter).vote(0));assert.equal((await c.getCandidate(0)).voteCount,1n);assert.equal(await c.hasVoted(await voter.getAddress()),true);});
  await test('Reject duplicate vote without changing tally',async()=>{await rejects(()=>c.connect(voter).vote.staticCall(0),'Wallet has already voted');assert.equal((await c.getCandidate(0)).voteCount,1n);});
  await test('Second wallet votes for Safin Joash',async()=>{await tx(()=>c.connect(other).vote(1));assert.equal((await c.getCandidate(1)).voteCount,1n);});
  await test('Reject unauthorized termination',()=>rejects(()=>c.connect(voter).endVoting.staticCall(),'Only admin can call this'));
  await test('End election permanently',async()=>{await tx(()=>c.endVoting());assert.equal(await c.electionEnded(),true);assert.equal(await c.votingOpen(),false);});
  await test('Reject vote after ending',()=>rejects(()=>c.vote.staticCall(0),'Voting is not open'));
  await test('Reject reopening and candidate additions after ending',async()=>{await rejects(()=>c.startVoting.staticCall(),'Election has ended');await rejects(()=>c.addCandidate.staticCall('Carol',''),'Election has ended');});
  // Mine a reverting transaction as evidence, bypassing gas estimation.
  let failed;
  try {await (await c.connect(other).vote(0,{gasLimit:150000})).wait();assert.fail('Expected failed receipt');}
  catch(e){assert.equal(e.receipt.status,0);failed={hash:e.receipt.hash,blockNumber:e.receipt.blockNumber,status:e.receipt.status};}
  results.push({name:'Mined invalid transaction has status zero',result:'PASS'});
  const report = {environment:'Isolated in-memory Ganache 7.9.2; not Remix or MetaMask',compiler:solc.version(),evmVersion:'paris',chainId:1337,contractAddress:await c.getAddress(),note:'Ephemeral test chain; these addresses and receipts are not the frontend deployment.',results,successfulReceipts:receipts,failedReceipt:failed};
  fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2)+'\n');
  await rpc.disconnect();
})().catch(e=>{console.error(e);process.exitCode=1;});
