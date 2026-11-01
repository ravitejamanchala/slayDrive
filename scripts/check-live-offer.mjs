// Run only before production publishing, never from the browser or PR tests.
const source=await (await fetch('https://app.slaydrive.com/auth-config.js',{cache:'no-store',signal:AbortSignal.timeout(15000)})).text();
const match=source.match(/window\.LEARNER_CONFIG\s*=\s*(\{[\s\S]*\})/);
if(!match)throw Error('Live app configuration is unavailable.');
const api=new URL(JSON.parse(match[1]).API_BASE_URL);
if(api.protocol!=='https:')throw Error('Expected an HTTPS application API.');
const response=await fetch(api.origin+'/billing/config',{signal:AbortSignal.timeout(15000)});
const value=await response.json();
if(!response.ok||!value.beta?.active||Date.parse(value.beta.endsAt)!==Date.parse('2026-12-01T00:00:00Z'))throw Error('The live app must grant the advertised free access before publishing this offer.');
console.log('Live app grants the advertised free access until 1 December 2026.');
