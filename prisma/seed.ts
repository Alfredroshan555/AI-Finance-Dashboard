import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding financial database...");

  // Clean existing database records
  await prisma.cashFlow.deleteMany({});
  await prisma.sIP.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.portfolio.deleteMany({});
  await prisma.user.deleteMany({});
  const demoPassword =
    process.env.DEMO_USER_PASSWORD || crypto.randomBytes(16).toString("hex");
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // 1. Create Demo User
  const user = await prisma.user.create({
    data: {
      email: "demo@finance.ai",
      name: "Aditya Sharma",
      passwordHash,
      currency: "INR",
    },
  });

  // 2. Create Portfolio
  const portfolio = await prisma.portfolio.create({
    data: {
      name: "Primary Wealth Portfolio",
      description: "Long-term equity, index, gold & tax-saving funds",
      userId: user.id,
    },
  });

  // 3. Create Assets
  const smallCapAsset = await prisma.asset.create({
    data: {
      symbol: "NIPPON_SMALL",
      isin: "INF204K01W87",
      name: "Nippon India Small Cap Fund - Direct Growth",
      category: "MUTUAL_FUND",
      assetClass: "SMALL_CAP",
      currentNAV: 168.45,
      currency: "INR",
    },
  });

  const flexiCapAsset = await prisma.asset.create({
    data: {
      symbol: "PPFC_DIRECT",
      isin: "INF879O01017",
      name: "Parag Parikh Flexi Cap Fund - Direct Growth",
      category: "MUTUAL_FUND",
      assetClass: "FLEXI_CAP",
      currentNAV: 82.3,
      currency: "INR",
    },
  });

  const indexAsset = await prisma.asset.create({
    data: {
      symbol: "UTI_NIFTY50",
      isin: "INF789F01X08",
      name: "UTI Nifty 50 Index Fund - Direct Growth",
      category: "MUTUAL_FUND",
      assetClass: "INDEX",
      currentNAV: 145.2,
      currency: "INR",
    },
  });

  const goldAsset = await prisma.asset.create({
    data: {
      symbol: "GOLDBEES",
      isin: "INF204KB1012",
      name: "Nippon India ETF Gold BeES",
      category: "ETF",
      assetClass: "COMMODITY",
      currentNAV: 64.8,
      currency: "INR",
    },
  });

  const equityAsset = await prisma.asset.create({
    data: {
      symbol: "HDFCBANK",
      isin: "INE040A01034",
      name: "HDFC Bank Limited Equity",
      category: "EQUITY",
      assetClass: "LARGE_CAP",
      currentNAV: 1620.5,
      currency: "INR",
    },
  });

  const debtAsset = await prisma.asset.create({
    data: {
      symbol: "ICICI_DEBT",
      isin: "INF109K011A8",
      name: "ICICI Prudential Corporate Bond Fund",
      category: "DEBT",
      assetClass: "DEBT",
      currentNAV: 26.4,
      currency: "INR",
    },
  });

  // 4. Create Active SIPs
  await prisma.sIP.createMany({
    data: [
      {
        portfolioId: portfolio.id,
        assetId: smallCapAsset.id,
        amount: 15000,
        frequency: "MONTHLY",
        dayOfMonth: 5,
        status: "ACTIVE",
        startDate: new Date("2024-01-05"),
        notes: "Small Cap Aggressive Growth SIP",
      },
      {
        portfolioId: portfolio.id,
        assetId: flexiCapAsset.id,
        amount: 25000,
        frequency: "MONTHLY",
        dayOfMonth: 10,
        status: "ACTIVE",
        startDate: new Date("2024-01-10"),
        notes: "Core Wealth Flexi Cap SIP",
      },
      {
        portfolioId: portfolio.id,
        assetId: indexAsset.id,
        amount: 20000,
        frequency: "MONTHLY",
        dayOfMonth: 1,
        status: "ACTIVE",
        startDate: new Date("2024-01-01"),
        notes: "Passive Nifty 50 Index SIP",
      },
      {
        portfolioId: portfolio.id,
        assetId: goldAsset.id,
        amount: 10000,
        frequency: "MONTHLY",
        dayOfMonth: 15,
        status: "ACTIVE",
        startDate: new Date("2024-03-15"),
        notes: "Hedge Gold BeES SIP",
      },
    ],
  });

  // 5. Create Historical Buy Transactions
  const transactions = [
    // Nippon Small Cap
    {
      assetId: smallCapAsset.id,
      units: 120,
      price: 125.0,
      amount: 15000,
      date: new Date("2024-01-05"),
    },
    {
      assetId: smallCapAsset.id,
      units: 115,
      price: 130.4,
      amount: 15000,
      date: new Date("2024-02-05"),
    },
    {
      assetId: smallCapAsset.id,
      units: 110,
      price: 136.3,
      amount: 15000,
      date: new Date("2024-03-05"),
    },
    {
      assetId: smallCapAsset.id,
      units: 105,
      price: 142.8,
      amount: 15000,
      date: new Date("2024-04-05"),
    },
    {
      assetId: smallCapAsset.id,
      units: 100,
      price: 150.0,
      amount: 15000,
      date: new Date("2024-05-05"),
    },
    {
      assetId: smallCapAsset.id,
      units: 95,
      price: 157.8,
      amount: 15000,
      date: new Date("2024-06-05"),
    },

    // Parag Parikh Flexi Cap
    {
      assetId: flexiCapAsset.id,
      units: 380,
      price: 65.7,
      amount: 25000,
      date: new Date("2024-01-10"),
    },
    {
      assetId: flexiCapAsset.id,
      units: 370,
      price: 67.5,
      amount: 25000,
      date: new Date("2024-02-10"),
    },
    {
      assetId: flexiCapAsset.id,
      units: 360,
      price: 69.4,
      amount: 25000,
      date: new Date("2024-03-10"),
    },
    {
      assetId: flexiCapAsset.id,
      units: 350,
      price: 71.4,
      amount: 25000,
      date: new Date("2024-04-10"),
    },
    {
      assetId: flexiCapAsset.id,
      units: 340,
      price: 73.5,
      amount: 25000,
      date: new Date("2024-05-10"),
    },
    {
      assetId: flexiCapAsset.id,
      units: 330,
      price: 75.7,
      amount: 25000,
      date: new Date("2024-06-10"),
    },

    // UTI Nifty 50
    {
      assetId: indexAsset.id,
      units: 160,
      price: 125.0,
      amount: 20000,
      date: new Date("2024-01-01"),
    },
    {
      assetId: indexAsset.id,
      units: 156,
      price: 128.2,
      amount: 20000,
      date: new Date("2024-02-01"),
    },
    {
      assetId: indexAsset.id,
      units: 152,
      price: 131.5,
      amount: 20000,
      date: new Date("2024-03-01"),
    },
    {
      assetId: indexAsset.id,
      units: 148,
      price: 135.1,
      amount: 20000,
      date: new Date("2024-04-01"),
    },
    {
      assetId: indexAsset.id,
      units: 144,
      price: 138.8,
      amount: 20000,
      date: new Date("2024-05-01"),
    },
    {
      assetId: indexAsset.id,
      units: 140,
      price: 142.8,
      amount: 20000,
      date: new Date("2024-06-01"),
    },

    // Gold BeES
    {
      assetId: goldAsset.id,
      units: 200,
      price: 50.0,
      amount: 10000,
      date: new Date("2024-03-15"),
    },
    {
      assetId: goldAsset.id,
      units: 190,
      price: 52.6,
      amount: 10000,
      date: new Date("2024-04-15"),
    },
    {
      assetId: goldAsset.id,
      units: 180,
      price: 55.5,
      amount: 10000,
      date: new Date("2024-05-15"),
    },
    {
      assetId: goldAsset.id,
      units: 170,
      price: 58.8,
      amount: 10000,
      date: new Date("2024-06-15"),
    },

    // Equity Direct Buy HDFC Bank
    {
      assetId: equityAsset.id,
      units: 100,
      price: 1450.0,
      amount: 145000,
      date: new Date("2024-02-20"),
    },

    // Debt Fund
    {
      assetId: debtAsset.id,
      units: 4000,
      price: 25.0,
      amount: 100000,
      date: new Date("2024-01-15"),
    },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        portfolioId: portfolio.id,
        assetId: t.assetId,
        type: "BUY",
        units: t.units,
        pricePerUnit: t.price,
        amount: t.amount,
        date: t.date,
        notes: "Automated seed transaction",
      },
    });
  }

  // 6. Cash Flow Entries
  await prisma.cashFlow.createMany({
    data: [
      {
        userId: user.id,
        type: "INCOME",
        category: "Salary",
        amount: 250000,
        date: new Date("2024-06-01"),
        description: "Monthly Tech Lead Salary",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        category: "Rent & Utilities",
        amount: 45000,
        date: new Date("2024-06-02"),
        description: "Apartment rent & bill payments",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        category: "SIP Investments",
        amount: 70000,
        date: new Date("2024-06-05"),
        description: "Auto debit SIP allocations",
      },
      {
        userId: user.id,
        type: "EXPENSE",
        category: "Lifestyle & Dining",
        amount: 30000,
        date: new Date("2024-06-12"),
        description: "Groceries, dining out, recreation",
      },
      {
        userId: user.id,
        type: "SAVING",
        category: "Emergency Fund",
        amount: 50000,
        date: new Date("2024-06-15"),
        description: "High yield savings transfer",
      },
    ],
  });

  console.log(
    "Database successfully seeded with demo user and financial records!",
  );
  if (!process.env.DEMO_USER_PASSWORD) {
    console.log(`Demo User Email: demo@finance.ai | Password: ${demoPassword}`);
    console.log(
      "Tip: You can set a fixed demo password by defining DEMO_USER_PASSWORD in your .env file.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
