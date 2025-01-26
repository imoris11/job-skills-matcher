# Skillful - Job Skills Matcher Chrome Extension

A Chrome extension that helps you analyze job listings and compare them with your skills using AI.

## Features

- Upload and save your resume/skills
- Analyze job listings with AI
- Get detailed match analysis with percentage scores
- Full-page job listing capture support
- Real-time skills comparison

## Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd job-skills-matcher
```

2. Get your OpenAI API key:
   
   - Visit OpenAI Platform
   - Create an account or sign in
   - Generate an API key
   - Replace OPENAI_API_KEY in background.js with your key
3. Load the extension in Chrome:
   
   - Open Chrome and go to chrome://extensions/
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the extension directory
## Usage
1. Set Up Your Resume
   
   - Click the extension icon in Chrome
   - Paste your resume text in the textarea
   - Click "Save Resume" to store your information
2. Analyze Job Listings
   
   - Navigate to any job listing webpage
   - Click the extension icon
   - Click "Analyze Job"
   - Wait for the analysis to complete
3. Understanding Results
   
   - Overall Match Score
   - Skills Category Matches
   - Required vs Your Skills
   - Recommendations for Improvement
## Analysis Details
The extension provides:

- Percentage match for each skill category
- Detailed comparison of your skills vs job requirements
- Specific recommendations for skill improvements
- Overall suitability assessment
## Privacy & Security
- Your resume is stored locally in your browser
- Only sends to OpenAI API:
  - Your resume text (during analysis)
  - Job listing screenshots
- No personal data is permanently stored
- Secure HTTPS for all API communications
## Troubleshooting
Common issues:

1. Extension Not Loading
   
   - Check Developer mode is enabled
   - Reload the extension
   - Verify all files are present
2. Analysis Not Working
   
   - Verify OpenAI API key
   - Ensure resume is saved
   - Check internet connection
## Support
For issues or feature requests:

- Create an issue in the repository
- Include detailed steps to reproduce issues
- Provide screenshots if relevant
## License
MIT License - Feel free to use and modify as needed.

Note : This extension is for evaluation purposes. Don't base job application decisions solely on its analysis.