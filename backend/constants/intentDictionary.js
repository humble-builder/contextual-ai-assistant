export const intentKeywords = {
    claims: {
        "claim": 3,
        "reimbursement": 4,
        "cashless": 4,
        "settlement": 3,
        "hospitalization": 2,
        "documents": 1,
    },

    policy: {
        "coverage": 4,
        "waiting period": 5,
        "grace period": 5,
        "renewal": 3,
        "premium": 2,
        "sum insured": 4,
    },

    kyc: {
        "kyc": 5,
        "identity": 3,
        "verification": 3,
        "address proof": 4,
    },
};

export const intentMaxScores = {
    claims: Object.values(intentKeywords.claims).reduce((a, b) => a + b, 0),
    policy: Object.values(intentKeywords.policy).reduce((a, b) => a + b, 0),
    kyc: Object.values(intentKeywords.kyc).reduce((a, b) => a + b, 0),
};
