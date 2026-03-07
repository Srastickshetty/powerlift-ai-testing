/**
 * TITAN-AI QA TEST: Instagram Scout Vision Test
 * Simulate "Vision-OCR" logic for meet flyer extraction
 * Expected: Extract Meet Name, Date, Location and map to user's home location
 */

console.log('🧪 TITAN-AI QA: Instagram Scout Vision Test');
console.log('==========================================');

// Mock OCR processing function (simulating Vision-OCR from Instagram scraper)
function mockVisionOCRProcessing(imageUrl) {
  console.log(`📸 Processing image: ${imageUrl}`);
  
  // Simulate OCR text extraction from a typical powerlifting meet flyer
  const mockOCRText = `
    2024 USAPL New York State Championships
    June 15-16, 2024
    Brooklyn Sports Center, Brooklyn, NY
    Entry Fee: $125
    Registration Deadline: June 1, 2024
    Weight Classes: M/W 53kg-120+kg
    Contact: info@nyusapl.org | (555) 123-4567
    Sanctioned by: USA Powerlifting
  `;
  
  console.log('📄 Extracted OCR Text:');
  console.log(mockOCRText);
  console.log('');
  
  return mockOCRText;
}

// Mock meet details extraction from OCR text
function extractMeetDetails(ocrText) {
  const details = {
    meet_name: '',
    date: '',
    location: '',
    federation: '',
    entry_fee: '',
    registration_deadline: '',
    contact_info: '',
    confidence_score: 0.0
  };
  
  // Extract meet name
  const nameMatch = ocrText.match(/(\d{4}\s+.+?\s+Championships?)/i);
  if (nameMatch) {
    details.meet_name = nameMatch[1].trim();
  }
  
  // Extract date
  const dateMatch = ocrText.match(/(June\s+\d{1,2}[-,]?\s*\d{4})/i);
  if (dateMatch) {
    details.date = dateMatch[1].trim();
  }
  
  // Extract location
  const locationMatch = ocrText.match(/([A-Za-z\s]+,\s*[A-Z]{2})/);
  if (locationMatch) {
    details.location = locationMatch[1].trim();
  }
  
  // Extract federation
  const fedMatch = ocrText.match(/(USAPL|USPA|IPA|APF|NASA)/i);
  if (fedMatch) {
    details.federation = fedMatch[1].toUpperCase();
  }
  
  // Extract entry fee
  const feeMatch = ocrText.match(/Entry Fee:\s*\$(\d+)/i);
  if (feeMatch) {
    details.entry_fee = `$${feeMatch[1]}`;
  }
  
  // Extract registration deadline
  const deadlineMatch = ocrText.match(/Registration Deadline:\s*(.+)/i);
  if (deadlineMatch) {
    details.registration_deadline = deadlineMatch[1].trim();
  }
  
  // Extract contact info
  const contactMatch = ocrText.match(/Contact:\s*(.+)/i);
  if (contactMatch) {
    details.contact_info = contactMatch[1].trim();
  }
  
  // Calculate confidence score based on fields extracted
  const fields = Object.keys(details).filter(key => key !== 'confidence_score');
  const filledFields = fields.filter(key => details[key] !== '').length;
  details.confidence_score = filledFields / fields.length;
  
  return details;
}

// Mock user location and meet matching
function calculateLocationMatch(meetLocation, userLocation) {
  console.log(`🗺️ Location Matching Analysis:`);
  console.log(`- Meet Location: ${meetLocation}`);
  console.log(`- User Location: ${userLocation.city}, ${userLocation.state}`);
  
  // Simple location matching (in real implementation, would use geocoding)
  const meetState = meetLocation.match(/,\s*([A-Z]{2})/);
  const userState = userLocation.state;
  
  let matchScore = 0;
  let distance = 0;
  
  if (meetState && meetState[1] === userState) {
    matchScore = 0.8; // Same state
    distance = 50; // Mock distance in miles
  } else {
    matchScore = 0.2; // Different state
    distance = 500; // Mock distance
  }
  
  return {
    matchScore,
    distance,
    recommendation: matchScore > 0.5 ? 'Recommended' : 'Consider if traveling'
  };
}

// Mock podium probability calculation
function calculatePodiumProbability(athleteProfile, meetDetails) {
  console.log(`🏆 Podium Probability Analysis:`);
  console.log(`- Athlete Total: ${athleteProfile.personalBest.total}kg`);
  console.log(`- Weight Class: ${athleteProfile.weightClass}`);
  console.log(`- Recent Placement: ${athleteProfile.recentPlacement}`);
  
  // Simplified podium probability calculation
  let baseProbability = 0.5;
  
  // Adjust based on recent performance
  if (athleteProfile.recentPlacement <= 3) {
    baseProbability += 0.3;
  } else if (athleteProfile.recentPlacement <= 5) {
    baseProbability += 0.1;
  }
  
  // Adjust based on total strength
  if (athleteProfile.personalBest.total > 500) {
    baseProbability += 0.1;
  }
  
  // Adjust based on experience
  if (athleteProfile.experienceYears > 3) {
    baseProbability += 0.05;
  }
  
  return {
    podiumProbability: Math.min(baseProbability, 0.95),
    confidenceInterval: {
      lower: Math.max(baseProbability - 0.15, 0.05),
      upper: Math.min(baseProbability + 0.15, 1.0)
    },
    recommendation: baseProbability > 0.6 ? 'Strong contender' : 'Competitive opportunity'
  };
}

// Test data
const testImageUrl = 'https://instagram.com/p/ABC123/media';
const mockUserLocation = {
  city: 'New York',
  state: 'NY',
  coordinates: { latitude: 40.7128, longitude: -74.0060 }
};

const mockAthleteProfile = {
  athleteId: 'athlete_001',
  weightClass: '83kg',
  personalBest: {
    squat: 220,
    bench: 140,
    deadlift: 280,
    total: 640
  },
  recentPlacement: 2,
  experienceYears: 4
};

// Run the test
try {
  console.log('📋 Step 1: OCR Processing');
  console.log('========================');
  const ocrText = mockVisionOCRProcessing(testImageUrl);
  
  console.log('🔍 Step 2: Details Extraction');
  console.log('=============================');
  const meetDetails = extractMeetDetails(ocrText);
  console.log('Extracted Details:', JSON.stringify(meetDetails, null, 2));
  console.log('');
  
  console.log('🗺️ Step 3: Location Matching');
  console.log('============================');
  const locationMatch = calculateLocationMatch(meetDetails.location, mockUserLocation);
  console.log(`Match Score: ${(locationMatch.matchScore * 100).toFixed(1)}%`);
  console.log(`Distance: ${locationMatch.distance} miles`);
  console.log(`Recommendation: ${locationMatch.recommendation}`);
  console.log('');
  
  console.log('🏆 Step 4: Podium Probability');
  console.log('=============================');
  const podiumAnalysis = calculatePodiumProbability(mockAthleteProfile, meetDetails);
  console.log(`Podium Probability: ${(podiumAnalysis.podiumProbability * 100).toFixed(1)}%`);
  console.log(`Confidence Interval: ${(podiumAnalysis.confidenceInterval.lower * 100).toFixed(1)}% - ${(podiumAnalysis.confidenceInterval.upper * 100).toFixed(1)}%`);
  console.log(`Recommendation: ${podiumAnalysis.recommendation}`);
  console.log('');
  
  // Final validation
  console.log('✅ TEST VALIDATION:');
  console.log('==================');
  
  const hasMeetName = meetDetails.meet_name !== '';
  const hasDate = meetDetails.date !== '';
  const hasLocation = meetDetails.location !== '';
  const hasFederation = meetDetails.federation !== '';
  const locationMatched = locationMatch.matchScore > 0.5;
  const podiumCalculated = podiumAnalysis.podiumProbability > 0;
  
  console.log(`Meet name extracted: ${hasMeetName ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Date extracted: ${hasDate ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Location extracted: ${hasLocation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Federation extracted: ${hasFederation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Location matched to user: ${locationMatched ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Podium probability calculated: ${podiumCalculated ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  const allTestsPassed = hasMeetName && hasDate && hasLocation && hasFederation && locationMatched && podiumCalculated;
  console.log(`🏆 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  // Output final JSON response
  console.log('');
  console.log('📋 EXTRACTED JSON RESPONSE:');
  console.log(JSON.stringify({
    meetDetails,
    locationMatch,
    podiumAnalysis,
    userLocation: mockUserLocation,
    timestamp: new Date().toISOString()
  }, null, 2));
  
} catch (error) {
  console.error('❌ TEST FAILED:', error.message);
  console.error(error.stack);
}
