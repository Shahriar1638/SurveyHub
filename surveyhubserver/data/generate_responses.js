const fs = require('fs');

const surveyIds = [
  "6a05d9adea9a6fedf592d31d", // Workforce Audit
  "6a05d9adea9a6fedf592d31e", // Finance Strategy
  "6a05d9adea9a6fedf592d31f"  // Smart City Audit
];

const userIds = [
  "6a057e985e1ef28d44f1a345",
  "6a057ee85e1ef28d44f1a358"
];

// Generate 58 more fake IDs to reach 60 unique users (20 per survey)
for (let i = 0; i < 58; i++) {
  userIds.push("6a057e985e1ef28d44f1a" + (400 + i).toString(16).padStart(3, '0'));
}

const responses = [];

// 1. Workforce Audit Responses
for (let i = 0; i < 20; i++) {
  responses.push({
    surveyId: surveyIds[0],
    userId: userIds[i],
    answers: [
      { questionId: "q1", label: "How long have you been with your current employer?", value: ["<1 year", "1-3 years", "3-5 years", "5+ years"][Math.floor(Math.random() * 4)] },
      { questionId: "q2", label: "Rate your overall job satisfaction.", value: Math.floor(Math.random() * 10) + 1 },
      { questionId: "q3", label: "Do you feel your work is fairly compensated?", value: ["Yes", "Somewhat", "No"][Math.floor(Math.random() * 3)] },
      { questionId: "q4", label: "Which benefits do you value most?", value: ["Health Insurance", "Remote Work", "Bonus"].slice(0, Math.floor(Math.random() * 3) + 1) },
      { questionId: "q5", label: "How would you rate the communication from leadership?", value: Math.floor(Math.random() * 5) + 1 },
      { questionId: "q6", label: "Do you see yourself at this company in 2 years?", value: ["Definitely", "Likely", "Unlikely"][Math.floor(Math.random() * 3)] },
      { questionId: "q7", label: "What is the most stressful part of your week?", value: "Deadlines and meetings" },
      { questionId: "q8", label: "Are you provided with the tools you need to succeed?", value: ["Always", "Mostly", "Rarely"][Math.floor(Math.random() * 3)] },
      { questionId: "q9", label: "How many hours of focused work do you achieve daily?", value: ["2-4", "4-6", "6+"][Math.floor(Math.random() * 3)] },
      { questionId: "q10", label: "Rate the diversity and inclusion at your workplace.", value: Math.floor(Math.random() * 5) + 1 },
      { questionId: "q11", label: "What is one thing you would change about your office culture?", value: "More flexibility and better mental health support." },
      { questionId: "q12", label: "Any final comments for the HR department?", value: "Keep up the good work on the new remote policy." }
    ]
  });
}

// 2. Finance Strategy Responses
for (let i = 0; i < 20; i++) {
  responses.push({
    surveyId: surveyIds[1],
    userId: userIds[i + 20],
    answers: [
      { questionId: "q1", label: "What is your primary financial goal?", value: ["Retirement", "Home purchase", "Travel"][Math.floor(Math.random() * 3)] },
      { questionId: "q2", label: "What percentage of your income do you save?", value: ["1-10%", "11-20%", "21%+"][Math.floor(Math.random() * 3)] },
      { questionId: "q3", label: "Where is the majority of your wealth held?", value: ["Cash", "Stocks"].slice(0, Math.floor(Math.random() * 2) + 1) },
      { questionId: "q4", label: "Rate your risk tolerance for investments.", value: Math.floor(Math.random() * 10) + 1 },
      { questionId: "q5", label: "Do you use a professional financial advisor?", value: ["Yes", "No"][Math.floor(Math.random() * 2)] },
      { questionId: "q6", label: "How often do you rebalance your portfolio?", value: ["Monthly", "Quarterly", "Annually"][Math.floor(Math.random() * 3)] },
      { questionId: "q7", label: "Are you concerned about currency devaluation?", value: ["Very concerned", "Somewhat"][Math.floor(Math.random() * 2)] },
      { questionId: "q8", label: "What is your annual household income range?", value: "$50k - $100k" },
      { questionId: "q9", label: "Which tax-advantaged accounts do you use?", value: ["401k/Pension", "IRA/ISA"].slice(0, Math.floor(Math.random() * 2) + 1) },
      { questionId: "q10", label: "How do you track your net worth?", value: "Spreadsheet and Mint" },
      { questionId: "q11", label: "Describe your investment philosophy in one sentence.", value: "Slow and steady growth with low-cost index funds." }
    ]
  });
}

// 3. Smart City Responses
for (let i = 0; i < 20; i++) {
  responses.push({
    surveyId: surveyIds[2],
    userId: userIds[i + 40],
    answers: [
      { questionId: "q1", label: "Which part of the city do you live in?", value: "Downtown" },
      { questionId: "q2", label: "Rate the reliability of the new autonomous shuttles.", value: Math.floor(Math.random() * 5) + 1 },
      { questionId: "q3", label: "How do you pay for transit most often?", value: ["Mobile App", "Contactless Card"][Math.floor(Math.random() * 2)] },
      { questionId: "q4", label: "Do you feel safe using public transit at night?", value: ["Yes", "Mostly", "No"][Math.floor(Math.random() * 3)] },
      { questionId: "q5", label: "Which infrastructure project should be prioritized?", value: ["Bike Lanes", "Parks"].slice(0, Math.floor(Math.random() * 2) + 1) },
      { questionId: "q6", label: "Have you noticed a decrease in your energy bill with the smart grid?", value: ["Yes", "No"][Math.floor(Math.random() * 2)] },
      { questionId: "q7", label: "Rate the air quality in your neighborhood.", value: Math.floor(Math.random() * 5) + 1 },
      { questionId: "q8", label: "How often do you use the city's mobile citizen portal?", value: ["Daily", "Weekly", "Monthly"][Math.floor(Math.random() * 3)] },
      { questionId: "q9", label: "What is the most frustrating part of living in this city?", value: "Traffic and high cost of living." },
      { questionId: "q10", label: "Would you recommend this city to a friend?", value: ["Yes", "No"][Math.floor(Math.random() * 2)] }
    ]
  });
}

fs.writeFileSync('f:/Job stuff/Projects/SurveyHub/surveyhubserver/data/fake_responses.json', JSON.stringify(responses, null, 2));
