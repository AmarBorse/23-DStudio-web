// Studio details printed on quotations (and later invoices). Edit here.
export const COMPANY = {
  name: "Twenty-Three D STUDIO",
  address: "Shop 1, Govind Sahnivas Co-op Society, Sharanpur Rd, P&T Colony, Nashik, INDIA 422005",
  email: "info@23dstudio.com",
  phone: "+91 90215 07499",
  website: "23dstudio.com",
};

// Pre-filled on every new quotation (can be changed per quotation)
export const QUOTE_DEFAULTS = {
  preparedByName: "ID. Ritika Yeole",
  preparedByPhone: "+91 93599 21928",
  validDays: 15,
  gstPercent: 18,
  closing: "We look forward to working with you on this project.",
  terms: [
    "The quotation includes only the drawings mentioned in the scope of work.",
    "Plumbing and electrical layouts will be charged separately if floor-wise changes are required.",
    "POP ceiling charges will depend on whether the design is the same or different on each floor.",
    "Any additional drawings or major revisions beyond the agreed scope will be charged extra.",
    "Work will begin after quotation approval, and payments will be made as mutually agreed.",
  ],
};

// Pre-filled on every new invoice (can be changed per invoice)
export const INVOICE_DEFAULTS = {
  // Text between **two stars** is printed in bold
  notes: [
    "Project will commence after **50% advance** is received.",
    "Final output will be released only after full payment is received.",
    "Changes in file After Final Approval are chargeable.",
    "Please provide accurate reference and textures for acceptable results.",
    "Renders provided are for screen viewing and not for offset and large media printing.",
  ],
  bank: [
    "Account Name:- Duse Gaurav Bharat",
    "Bank Name:- Bank of Baroda",
    "Acc. NO. :- 42890100004422",
    "IFSC Code:- BARB0TRINAS  (Fifth Character is Zero)",
  ],
  closing: "Thank you for choosing us!",
  gstPercent: 18,
};
