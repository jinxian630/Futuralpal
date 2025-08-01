// Test script for extract-text API route
// Run with: node scripts/test-extract-text.js

const fs = require('fs')
const path = require('path')

// Create test files for local testing
function createTestFiles() {
  const testDir = path.join(__dirname, 'test-files')
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // Create test text file
  const textContent = `# Test Document for Extract-Text API

This is a test document to verify the extract-text functionality.

## Key Concepts
- Artificial Intelligence
- Machine Learning  
- Natural Language Processing

## Mathematical Formulas
E = mc²
F = ma

## Learning Objectives
1. Understand text extraction
2. Test PDF processing
3. Validate DOCX handling
4. Check error handling

## Sample Data
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

### Important Notes
- This file tests basic text extraction
- Contains various formatting elements
- Includes special characters: àáâãäåæçèéêë
- Numbers: 123, 456.789, 1,000,000

## Conclusion
This document should be successfully processed by the extract-text API.
Total character count: approximately 800 characters.`

  fs.writeFileSync(path.join(testDir, 'test-document.txt'), textContent)
  
  // Create markdown test file
  const markdownContent = `# Advanced Study Material

## Introduction
This **markdown** file contains *formatted* text for testing.

### Code Blocks
\`\`\`javascript
function testFunction() {
  console.log("Testing extract-text API");
  return true;
}
\`\`\`

### Lists
1. First item
2. Second item
3. Third item

- Bullet point 1
- Bullet point 2

### Tables
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |

### Links and Images
[Test Link](https://example.com)
![Test Image](image.png)

### Mathematical Expressions
- Area of circle: πr²
- Quadratic formula: x = (-b ± √(b²-4ac)) / 2a

## Performance Testing
This section contains repeated content to test performance with larger text files.
${'This line is repeated for testing purposes. '.repeat(100)}

## Final Notes
- Total estimated length: ~2000 characters
- Contains various markdown elements
- Should be processed successfully`

  fs.writeFileSync(path.join(testDir, 'test-document.md'), markdownContent)

  // Create a large text file for performance testing
  const largeContent = `# Large Document Performance Test

This document is designed to test the performance of the extract-text API with larger files.

## Content Sections

${Array.from({ length: 50 }, (_, i) => `
### Section ${i + 1}
This is section ${i + 1} of the large document. It contains educational content about various topics including:
- Science and Technology
- Mathematics and Statistics  
- Literature and History
- Arts and Culture

The purpose is to simulate a real educational document that might be uploaded by students.
Important formulas in this section:
- E = mc² (Einstein's mass-energy equivalence)
- F = ma (Newton's second law)
- A = πr² (Area of a circle)

Sample paragraph with detailed explanation:
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Key learning points:
1. Understanding core concepts
2. Applying theoretical knowledge
3. Solving practical problems
4. Connecting different topics

End of section ${i + 1}.
`).join('\n')}

## Document Summary
This large document contains approximately ${50 * 800} characters and tests:
- Memory efficiency with larger files
- Processing speed optimization
- Proper text extraction and formatting
- Error handling for complex documents

Generated at: ${new Date().toISOString()}`

  fs.writeFileSync(path.join(testDir, 'large-test-document.txt'), largeContent)

  console.log('✅ Test files created successfully!')
  console.log(`📁 Test directory: ${testDir}`)
  console.log('📄 Files created:')
  console.log('  - test-document.txt (small, ~800 chars)')
  console.log('  - test-document.md (medium, ~2000 chars)')  
  console.log('  - large-test-document.txt (large, ~40000 chars)')
}

// Test the extract-text API endpoint
async function testExtractTextAPI() {
  const testDir = path.join(__dirname, 'test-files')
  const testFiles = [
    { name: 'test-document.txt', type: 'text/plain' },
    { name: 'test-document.md', type: 'text/markdown' },
    { name: 'large-test-document.txt', type: 'text/plain' }
  ]

  console.log('\n🧪 Testing Extract-Text API...\n')

  for (const { name, type } of testFiles) {
    const filePath = path.join(testDir, name)
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${name}`)
      continue
    }

    console.log(`📤 Testing: ${name}`)
    console.log(`📊 File size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`)

    try {
      const fileBuffer = fs.readFileSync(filePath)
      const formData = new FormData()
      
      // Create a File-like object for testing
      const file = new File([fileBuffer], name, { type })
      formData.append('file', file)

      const startTime = Date.now()
      
      const response = await fetch('http://localhost:3000/api/extract-text', {
        method: 'POST',
        body: formData
      })

      const processingTime = Date.now() - startTime
      const result = await response.json()

      console.log(`⏱️  Processing time: ${processingTime}ms`)
      
      if (result.success) {
        console.log(`✅ Success: Extracted ${result.data.originalLength} characters`)
        console.log(`📋 Request ID: ${result.data.fileInfo.requestId}`)
        
        if (result.performance) {
          console.log(`📈 Performance metrics:`)
          console.log(`   - File size: ${result.performance.fileSizeKB} KB`)
          console.log(`   - Text length: ${result.performance.textLengthChars} chars`)
          console.log(`   - Processing time: ${result.performance.processingTimeMs}ms`)
        }
      } else {
        console.log(`❌ Error: ${result.error}`)
        if (result.details) console.log(`   Details: ${result.details}`)
        if (result.suggestions) {
          console.log(`   Suggestions:`)
          result.suggestions.forEach(s => console.log(`   - ${s}`))
        }
      }
      
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`)
    }
    
    console.log('') // Empty line for readability
  }
}

// Test error scenarios
async function testErrorScenarios() {
  console.log('🚨 Testing Error Scenarios...\n')

  const errorTests = [
    {
      name: 'No file',
      test: async () => {
        const formData = new FormData()
        const response = await fetch('http://localhost:3000/api/extract-text', {
          method: 'POST',
          body: formData
        })
        return response.json()
      }
    },
    {
      name: 'Empty file',
      test: async () => {
        const formData = new FormData()
        const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' })
        formData.append('file', emptyFile)
        const response = await fetch('http://localhost:3000/api/extract-text', {
          method: 'POST',
          body: formData
        })
        return response.json()
      }
    },
    {
      name: 'Unsupported file type',
      test: async () => {
        const formData = new FormData()
        const imageFile = new File(['fake image data'], 'test.jpg', { type: 'image/jpeg' })
        formData.append('file', imageFile)
        const response = await fetch('http://localhost:3000/api/extract-text', {
          method: 'POST',
          body: formData
        })
        return response.json()
      }
    },
    {
      name: 'Very small content',
      test: async () => {
        const formData = new FormData()
        const smallFile = new File(['hi'], 'tiny.txt', { type: 'text/plain' })
        formData.append('file', smallFile)
        const response = await fetch('http://localhost:3000/api/extract-text', {
          method: 'POST',
          body: formData
        })
        return response.json()
      }
    }
  ]

  for (const { name, test } of errorTests) {
    console.log(`🧪 Testing: ${name}`)
    
    try {
      const result = await test()
      
      if (result.success) {
        console.log(`   ⚠️  Expected error but got success`)
      } else {
        console.log(`   ✅ Error handled correctly: ${result.error}`)
        if (result.requestId) console.log(`   📋 Request ID: ${result.requestId}`)
      }
    } catch (error) {
      console.log(`   💥 Network error: ${error.message}`)
    }
    
    console.log('')
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Extract-Text API Testing Suite')
  console.log('================================\n')

  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000/api/ollama-health')
    const health = await healthCheck.json()
    console.log(`🏥 Server health: ${health.success ? '✅ OK' : '❌ Issues detected'}`)
    if (!health.success) {
      console.log(`   Error: ${health.error}`)
    }
    console.log('')
  } catch (error) {
    console.log('❌ Server not running or not accessible at http://localhost:3000')
    console.log('   Please start the server with: npm run dev')
    console.log('')
    return
  }

  // Create test files
  createTestFiles()
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Test normal scenarios
  await testExtractTextAPI()
  
  // Test error scenarios
  await testErrorScenarios()
  
  console.log('🎉 Testing completed!')
  console.log('\n📊 Summary:')
  console.log('- Check the server logs for detailed processing information')
  console.log('- Look for [EXTRACT-TEXT] prefixed logs with timestamps')
  console.log('- Request IDs help track individual requests')
  console.log('- Performance metrics show processing efficiency')
}

// Handle command line arguments
if (process.argv.includes('--create-files')) {
  createTestFiles()
} else if (process.argv.includes('--test-api')) {
  testExtractTextAPI()
} else if (process.argv.includes('--test-errors')) {
  testErrorScenarios()
} else {
  runTests()
} 