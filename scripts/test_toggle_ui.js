const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testToggleInUI() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = `C:\\Users\\USER\\AppData\\Local\\Temp\\chrome_toggle_${Date.now()}`;
  const port = 9343;
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:3000/dashboard'
  ]);

  let tabs = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      tabs = await res.json();
      if (tabs && tabs.length > 0) break;
    } catch (e) {}
  }

  const target = tabs.find((t) => t.url.includes('localhost:3000')) || tabs[0];
  const WebSocket = globalThis.WebSocket || require('ws');
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (evt) => {
        const data = JSON.parse(evt.data || evt);
        if (data.id === msgId) {
          ws.removeEventListener ? ws.removeEventListener('message', handler) : ws.off('message', handler);
          resolve(data.result);
        }
      };
      ws.addEventListener ? ws.addEventListener('message', handler) : ws.on('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onopen = async () => {
    await send('Runtime.enable');
    await send('Log.enable');

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data || evt);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log('[CONSOLE]', text);
      }
    };

    await new Promise((r) => setTimeout(r, 4000));

    // Navigate to pricing tab in dashboard
    console.log('Navigating to pricing tab...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        // Find pricing tab or button
        const buttons = Array.from(document.querySelectorAll('button, [role="tab"]'));
        const pricingTab = buttons.find(b => b.textContent.includes('Pricelist') || b.textContent.includes('Pricing') || b.textContent.includes('Paket'));
        if (pricingTab) {
          pricingTab.click();
          return 'Clicked pricing tab: ' + pricingTab.textContent;
        }
        return 'No pricing tab button found, available: ' + buttons.map(b => b.textContent.trim()).filter(Boolean).slice(0, 10).join(' | ');
      })()`,
      returnByValue: true
    }).then(r => console.log('Tab switch result:', r.result.value));

    await new Promise((r) => setTimeout(r, 1500));

    // Check switches in DOM
    const switchCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const switches = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        return {
          count: switches.length,
          states: switches.map(s => ({ checked: s.checked, name: s.name, parentText: s.closest('label')?.textContent || '' }))
        };
      })()`,
      returnByValue: true
    });
    console.log('Switches found:', JSON.stringify(switchCheck.result.value, null, 2));

    // Toggle the first switch
    console.log('Clicking the first toggle switch...');
    const clickResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const switches = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        if (switches.length > 0) {
          const s = switches[0];
          s.click();
          return { clicked: true, newState: s.checked };
        }
        return { clicked: false };
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickResult.result.value);

    // Wait 2 seconds for API call to finish
    await new Promise((r) => setTimeout(r, 2000));

    // Now check Supabase database directly for tier-1 active state!
    const { data: dbTier, error: dbErr } = await supabase.from('PricingTier').select('id, name, active').eq('id', 'tier-1');
    console.log('=== DATABASE DIRECT QUERY AFTER TOGGLE ===');
    console.log(dbTier || dbErr);

    ws.close();
    chrome.kill();
    process.exit(0);
  };
}

testToggleInUI();
