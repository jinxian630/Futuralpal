// Simple test script to verify GPT-4o Vision is working
const { callGPT4o } = require('./lib/gpt4o-client');

async function testVision() {
  console.log('🧪 Testing GPT-4o Vision functionality...');
  
  try {
    // Valid 1x1 red pixel PNG
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const response = await callGPT4o(
      'Describe what you see in this test image. Just say "Vision test successful" if you can see it.', 
      testImage, 
      'image/png'
    );
    
    console.log('✅ Vision Response:', response);
    
    if (response && response.length > 0) {
      console.log('🎉 GPT-4o Vision is working correctly!');
      return true;
    } else {
      console.log('❌ No response received from vision API');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Vision test failed:', error.message);
    return false;
  }
}

// Run test if called directly
if (require.main === module) {
  testVision();
}

module.exports = { testVision };