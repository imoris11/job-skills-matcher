const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Add resume storage and retrieval functions
async function storeResume(resumeText) {
  await chrome.storage.local.set({ userResume: resumeText });
}

async function getResume() {
  const data = await chrome.storage.local.get('userResume');
  return data.userResume;
}

// Add API key storage and retrieval functions
async function storeApiKey(apiKey) {
  await chrome.storage.local.set({ openaiApiKey: apiKey });
}

async function getApiKey() {
  const data = await chrome.storage.local.get('openaiApiKey');
  return data.openaiApiKey;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STORE_RESUME') {
    storeResume(message.resumeText)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (message.type === 'ANALYZE_JOB') {
    analyzeJobListing(message.screenshots)
      .then(response => sendResponse({ analysis: response }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

  if (message.type === 'STORE_API_KEY') {
    storeApiKey(message.apiKey)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }

});

async function analyzeJobListing(screenshots) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('Please set your OpenAI API key first');
    }

    const userResume = await getResume();
    if (!userResume) {
      throw new Error('Please upload your resume first');
    }

    // Create content array with all screenshots
    const content = [
      {
        type: "text",
        text: `Please analyze this complete job listing (which may span multiple screenshots) and compare it with my skills to provide a detailed match analysis. ${userResume}. Add an overall match score at the beginning. Add a percentage match for each skill category. In the conclusion provide a honest review if I should apply for the role or not.`
      }
    ];

    // Add all screenshots to content array
    screenshots.forEach(screenshot => {
      content.push({
        type: "image_url",
        image_url: {
          url: screenshot
        }
      });
    });

    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an experienced professional recruiter with over 15 years of experience across various industries. You excel at evaluating candidates' qualifications, experience, 
            and potential fit for diverse roles. Provide detailed, honest, and constructive feedback about the candidate's suitability for the position. 
            Consider both hard and soft skills, highlighting strengths and areas for growth. Be direct but encouraging in your assessment. 
            Add emojis to indicate if there is a match for each category.`
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API Response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }
      
      // Format the response content
      const content = data.choices[0].message.content;
      const formattedContent = formatAnalysisResponse(content);
      return formattedContent;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('Full Error:', error);
    throw new Error(`Failed to analyze job listing: ${error.message}`);
  }
}

function formatAnalysisResponse(content) {
  // Clean up any stray # characters and standardize headers
  content = content.replace(/^#+\s*/gm, '');
  
  // Split content into sections based on clear section indicators
  const sections = content.split(/(?=Overall Match Score:|Match Analysis|Conclusion)/g);
  
  let html = '<div class="analysis-container">';
  
  sections.forEach(section => {
    if (section.trim()) {
      // Extract section title and content
      const lines = section.trim().split('\n');
      const title = lines[0];
      const sectionContent = lines.slice(1).join('\n');
      
      html += `
        <div class="analysis-section">
          <h3>${title}</h3>
          ${formatSection(sectionContent)}
        </div>
      `;
    }
  });
  
  html += '</div>';
  return html;
}

function formatSection(content) {
  return content
    // Remove any remaining # characters at the start of lines
    .replace(/^#+\s*/gm, '')
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert bullet points
    .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
    // Wrap lists in ul tags
    .replace(/<li>.*?(?=<\/li>).*?<\/li>/gs, match => `<ul>${match}</ul>`)
    // Convert line breaks
    .replace(/\n/g, '<br>')
    // Clean up any double breaks
    .replace(/<br><br>/g, '<br>')
    // Clean up any remaining markdown artifacts
    .replace(/####\s*/g, '<h4>')
    .trim();
}
