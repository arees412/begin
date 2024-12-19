const express = require('express');
const router = express.Router();
const schoolsData = require('../cleaned_schools_data.json');

// Endpoint to get unique addresses
router.get('/addresses', (req, res) => {
  const uniqueAddresses = [...new Set(schoolsData.map(school => school.address))];
  res.json(uniqueAddresses);
});

// Endpoint to get unique boards
router.get('/boards', (req, res) => {
  const uniqueBoards = [...new Set(schoolsData.map(school => school.board))];
  res.json(uniqueBoards);
});

router.post('/search-schools', (req, res) => {
  const { addresses = [], boards = [], fees = "" } = req.body;
  console.log(addresses);
  console.log(boards);
  console.log(fees);

  // Score each school and note matching attributes
  const scoredSchools = schoolsData.map(school => {
    let score = 0;
    let matches = [];

    // Check address match
    if (addresses.length > 0 && addresses.includes(school.address)) {
      score += 1;
      matches.push('address');
    }

    // Check board match
    if (boards.length > 0 && boards.some(board => school.board.includes(board))) {
      score += 1;
      matches.push('board');
    }

    // Check fee range match
    if (fees && checkFeesWithinRange(school.fees, fees)) {
      score += 1;
      matches.push('fees');
    }

    return {
      ...school,
      matched: score,
      matchedAttributes: matches.join(', ')
    };
  }).filter(school => school.matched > 0); // Filter out schools with a match score of 0

  if (scoredSchools.length === 0) {
    res.status(404).json({ message: "No schools found matching the criteria." });
  } else {
    res.json(scoredSchools);
  }
});

function checkFeesWithinRange(schoolFees, range) {
  const [minFee, maxFee] = range.split('-').map(Number);
  const [schoolMinFee, schoolMaxFee] = schoolFees.split('-').map(fee => parseInt(fee, 10));
  return schoolMinFee >= minFee && schoolMaxFee <= maxFee;
}




// Endpoint to get unique, sorted fees
router.get('/fees', (req, res) => {
  const allFees = schoolsData.map(school => school.fees.trim()); // Trim whitespace
  const uniqueFeesSet = new Set(allFees); // Use a Set to remove duplicates
  const uniqueFeesArray = Array.from(uniqueFeesSet); // Convert Set back to Array

  // Sort the fees array based on the numerical value of the minimum fee in each range
  uniqueFeesArray.sort((a, b) => {
    const minFeeA = parseInt(a.split('-')[0].replace(/,/g, '').trim());
    const minFeeB = parseInt(b.split('-')[0].replace(/,/g, '').trim());
    return minFeeA - minFeeB;
  });

  res.json(uniqueFeesArray);
});






module.exports = router;