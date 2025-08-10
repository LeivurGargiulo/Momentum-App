// Test script for onboarding language selection feature
// Run this in the browser console to test the feature

console.log('🧪 Testing Onboarding Language Selection Feature');

// Function to clear onboarding state
function resetOnboarding() {
  console.log('🔄 Resetting onboarding state...');
  localStorage.removeItem('activity-tracker-activities');
  localStorage.removeItem('momentum-language');
  console.log('✅ Onboarding state cleared');
}

// Function to test language selection
function testLanguageSelection() {
  console.log('🌍 Testing language selection...');
  
  // Check if language selection step exists
  const languageStep = document.querySelector('[data-testid="language-selection"]') || 
                      document.querySelector('h2')?.textContent?.includes('Language') ||
                      document.querySelector('h2')?.textContent?.includes('Idioma');
  
  if (languageStep) {
    console.log('✅ Language selection step found');
    
    // Check for language buttons
    const languageButtons = document.querySelectorAll('button');
    const englishButton = Array.from(languageButtons).find(btn => 
      btn.textContent.includes('English') || btn.textContent.includes('Español')
    );
    
    if (englishButton) {
      console.log('✅ Language selection buttons found');
      return true;
    } else {
      console.log('❌ Language selection buttons not found');
      return false;
    }
  } else {
    console.log('❌ Language selection step not found');
    return false;
  }
}

// Function to test onboarding flow
function testOnboardingFlow() {
  console.log('🚀 Testing onboarding flow...');
  
  // Check if we're in onboarding mode
  const isOnboarding = document.querySelector('h1')?.textContent?.includes('Welcome') ||
                      document.querySelector('h1')?.textContent?.includes('Bienvenido');
  
  if (isOnboarding) {
    console.log('✅ Onboarding mode detected');
    
    // Test step indicator
    const stepIndicators = document.querySelectorAll('.w-3.h-3.rounded-full');
    if (stepIndicators.length >= 3) {
      console.log('✅ Step indicator shows 3 steps');
    } else {
      console.log('❌ Step indicator should show 3 steps');
    }
    
    return testLanguageSelection();
  } else {
    console.log('❌ Not in onboarding mode');
    return false;
  }
}

// Function to simulate language selection
function simulateLanguageSelection(language) {
  console.log(`🌍 Simulating ${language} language selection...`);
  
  const buttons = document.querySelectorAll('button');
  const targetButton = Array.from(buttons).find(btn => 
    btn.textContent.includes(language === 'en' ? 'English' : 'Español')
  );
  
  if (targetButton) {
    targetButton.click();
    console.log(`✅ ${language} language selected`);
    
    // Check if language changed
    setTimeout(() => {
      const currentLanguage = localStorage.getItem('momentum-language');
      console.log(`🌍 Current language: ${currentLanguage}`);
      
      if (currentLanguage === language) {
        console.log('✅ Language change successful');
      } else {
        console.log('❌ Language change failed');
      }
    }, 100);
    
    return true;
  } else {
    console.log(`❌ ${language} language button not found`);
    return false;
  }
}

// Main test function
function runTests() {
  console.log('🧪 Starting onboarding language selection tests...\n');
  
  // Test 1: Check if onboarding is active
  console.log('📋 Test 1: Onboarding Mode Check');
  const onboardingActive = testOnboardingFlow();
  console.log(onboardingActive ? '✅ PASS' : '❌ FAIL');
  console.log('');
  
  if (onboardingActive) {
    // Test 2: Test English language selection
    console.log('📋 Test 2: English Language Selection');
    const englishTest = simulateLanguageSelection('en');
    console.log(englishTest ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Test 3: Test Spanish language selection
    console.log('📋 Test 3: Spanish Language Selection');
    const spanishTest = simulateLanguageSelection('es');
    console.log(spanishTest ? '✅ PASS' : '❌ FAIL');
    console.log('');
  }
  
  console.log('🏁 Tests completed!');
}

// Export functions for manual testing
window.testOnboarding = {
  resetOnboarding,
  testLanguageSelection,
  testOnboardingFlow,
  simulateLanguageSelection,
  runTests
};

console.log('📝 Test functions available at window.testOnboarding');
console.log('💡 Run window.testOnboarding.runTests() to start testing');
console.log('💡 Run window.testOnboarding.resetOnboarding() to reset state');