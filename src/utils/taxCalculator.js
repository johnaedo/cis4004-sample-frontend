// Tax brackets for 2024
export const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { rate: 0.10, limit: 11600 },
    { rate: 0.12, limit: 47150 },
    { rate: 0.22, limit: 100525 },
    { rate: 0.24, limit: 191950 },
    { rate: 0.32, limit: 243725 },
    { rate: 0.35, limit: 609350 },
    { rate: 0.37, limit: Infinity }
  ],
  married: [
    { rate: 0.10, limit: 23200 },
    { rate: 0.12, limit: 94300 },
    { rate: 0.22, limit: 201050 },
    { rate: 0.24, limit: 383900 },
    { rate: 0.32, limit: 487450 },
    { rate: 0.35, limit: 731200 },
    { rate: 0.37, limit: Infinity }
  ],
  headOfHousehold: [
    { rate: 0.10, limit: 16550 },
    { rate: 0.12, limit: 63100 },
    { rate: 0.22, limit: 100500 },
    { rate: 0.24, limit: 191950 },
    { rate: 0.32, limit: 243700 },
    { rate: 0.35, limit: 609350 },
    { rate: 0.37, limit: Infinity }
  ],
  marriedSeparate: [
    { rate: 0.10, limit: 11600 },
    { rate: 0.12, limit: 47150 },
    { rate: 0.22, limit: 100525 },
    { rate: 0.24, limit: 191950 },
    { rate: 0.32, limit: 243725 },
    { rate: 0.35, limit: 365700 },
    { rate: 0.37, limit: Infinity }
  ]
};

// Standard deductions for 2024
export const STANDARD_DEDUCTIONS = {
  single: 14600,
  married: 29200,
  headOfHousehold: 21900,
  marriedSeparate: 14600
};

// Self-employment tax rates
export const SELF_EMPLOYMENT_TAX = {
  socialSecurity: 0.124,
  medicare: 0.029,
  totalRate: 0.153
};

// Common state tax rates (simplified for example)
export const STATE_TAX_RATES = {
  FL: { name: 'Florida', rate: 0 },
  NY: { name: 'New York', rate: 0.0685 },
  CA: { name: 'California', rate: 0.0750 },
  TX: { name: 'Texas', rate: 0 },
  // Add more states as needed
};

export const calculateTaxBracketBreakdown = (income, filingStatus) => {
  const brackets = FEDERAL_TAX_BRACKETS_2024[filingStatus];
  let remainingIncome = income;
  let previousLimit = 0;
  const breakdown = [];

  for (const bracket of brackets) {
    const taxableInThisBracket = Math.min(
      Math.max(0, remainingIncome),
      bracket.limit - previousLimit
    );
    
    if (taxableInThisBracket <= 0) break;

    breakdown.push({
      rate: bracket.rate,
      amount: taxableInThisBracket,
      tax: taxableInThisBracket * bracket.rate
    });

    remainingIncome -= taxableInThisBracket;
    previousLimit = bracket.limit;
  }

  return breakdown;
};

export const calculateSelfEmploymentTax = (selfEmploymentIncome) => {
  const taxableIncome = selfEmploymentIncome * 0.9235; // 92.35% of SE income is taxable
  return {
    socialSecurity: taxableIncome * SELF_EMPLOYMENT_TAX.socialSecurity,
    medicare: taxableIncome * SELF_EMPLOYMENT_TAX.medicare,
    total: taxableIncome * SELF_EMPLOYMENT_TAX.totalRate
  };
};

export const calculateStateTax = (income, state, deductions = 0) => {
  const stateInfo = STATE_TAX_RATES[state];
  if (!stateInfo) return 0;
  return Math.max(0, (income - deductions) * stateInfo.rate);
};

export const calculateTotalTax = ({
  income,
  filingStatus,
  deductions = [],
  credits = [],
  state = null,
  selfEmploymentIncome = 0,
  previousYearIncome = null
}) => {
  // Calculate total deductions
  const totalItemizedDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  
  // Use the larger of standard or itemized deductions
  const effectiveDeduction = Math.max(totalItemizedDeductions, standardDeduction);

  // Calculate adjusted gross income (AGI)
  const adjustedGrossIncome = income;
  
  // Calculate taxable income after all deductions
  const taxableIncome = Math.max(0, adjustedGrossIncome - effectiveDeduction);

  // Calculate federal tax
  const federalBreakdown = calculateTaxBracketBreakdown(taxableIncome, filingStatus);
  const federalTax = federalBreakdown.reduce((sum, b) => sum + b.tax, 0);

  // Calculate self-employment tax
  const seTax = calculateSelfEmploymentTax(selfEmploymentIncome);

  // Calculate state tax using AGI and allowing for state-specific deductions
  const stateTax = state ? calculateStateTax(adjustedGrossIncome, state, effectiveDeduction) : 0;

  // Apply credits (dollar for dollar reduction in tax)
  const totalCredits = credits.reduce((sum, c) => sum + c.amount, 0);

  // Calculate final tax
  const totalTaxBeforeCredits = federalTax + seTax.total + stateTax;
  const finalTax = Math.max(0, totalTaxBeforeCredits - totalCredits);

  return {
    adjustedGrossIncome,
    taxableIncome,
    federalTax,
    federalBreakdown,
    selfEmploymentTax: seTax,
    stateTax,
    totalTax: finalTax,
    effectiveRate: (finalTax / income) * 100,
    deductions: {
      itemized: totalItemizedDeductions,
      standard: standardDeduction,
      effective: effectiveDeduction,
      breakdown: deductions
    },
    credits: {
      total: totalCredits,
      breakdown: credits
    },
    yearOverYear: previousYearIncome ? {
      difference: finalTax - previousYearIncome.totalTax,
      percentageChange: ((finalTax - previousYearIncome.totalTax) / previousYearIncome.totalTax) * 100
    } : null
  };
}; 