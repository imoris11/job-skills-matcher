
// Load saved resume when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.storage.local.get('userResume');
  if (data.userResume) {
    document.getElementById('resumeText').value = data.userResume;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const analyzeContainer = document.getElementById('analyzeContainer');
  const noJobMessage = document.getElementById('noJobMessage');

  if (tab.url && tab.url !== 'chrome://newtab/') {
    analyzeContainer.style.display = 'block';
    noJobMessage.style.display = 'none';
  } else {
    analyzeContainer.style.display = 'none';
    noJobMessage.style.display = 'block';
  }

  const apiKeySection = document.getElementById('apiKeySection');
  const mainContent = document.getElementById('mainContent');
  const editApiKeyBtn = document.getElementById('editApiKeyBtn');

  const apiData = await chrome.storage.local.get('openaiApiKey');
  if (apiData.openaiApiKey) {
    apiKeySection.style.display = 'none';
    mainContent.style.display = 'block';
    editApiKeyBtn.style.display = 'block';
  } else {
    apiKeySection.style.display = 'block';
    mainContent.style.display = 'none';
    editApiKeyBtn.style.display = 'none';
  }
});

// Handle API key saving
document.getElementById('saveApiKeyBtn').addEventListener('click', async () => {
  const apiKey = document.getElementById('apiKeyInput').value;
  if (!apiKey) {
    alert('Please enter an API key');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'STORE_API_KEY',
      apiKey: apiKey
    });

    if (response.success) {
      document.getElementById('apiKeyInput').value = '';
      document.getElementById('apiKeySection').style.display = 'none';
      document.getElementById('mainContent').style.display = 'block';
      document.getElementById('editApiKeyBtn').style.display = 'block';
    } else {
      alert('Failed to save API key: ' + response.error);
    }
  } catch (error) {
    alert('Error saving API key: ' + error.message);
  }
});

document.getElementById('editApiKeyBtn').addEventListener('click', () => {
  document.getElementById('apiKeySection').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
});

// Handle resume saving
document.getElementById('saveResumeBtn').addEventListener('click', async () => {
  const resumeText = document.getElementById('resumeText').value;
  try {
    await chrome.runtime.sendMessage({
      type: 'STORE_RESUME',
      resumeText: resumeText
    });
    alert('Resume saved successfully!');
  } catch (error) {
    alert('Failed to save resume: ' + error.message);
  }
});

async function captureFullPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Inject script to get page dimensions
  const dimensions = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      return {
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight
      };
    }
  });

  const { scrollHeight, clientHeight } = dimensions[0].result;
  const screenshots = [];
  
  // Scroll and capture each section
  for (let position = 0; position < scrollHeight; position += clientHeight) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (pos) => window.scrollTo(0, pos),
      args: [position]
    });
    
    // Wait for scroll to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const screenshot = await chrome.tabs.captureVisibleTab();
    screenshots.push(screenshot);
  }

  // Reset scroll position
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.scrollTo(0, 0)
  });

  return screenshots;
}

document.getElementById('analyzeBtn').addEventListener('click', async () => {
  try {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Capturing and analyzing job listing...</p>
      </div>
    `;
    
    const screenshots = await captureFullPage();
    
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_JOB',
      screenshots: screenshots // Send array of screenshots
    });

    resultsDiv.innerHTML = response.analysis;
  } catch (error) {
    document.getElementById('results').innerHTML = `Error: ${error.message}`;
  }
});
