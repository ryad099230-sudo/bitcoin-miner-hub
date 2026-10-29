# Bitcoin Miner Hub

BUILD AND UPGRADE THE EXISTING BITCOIN MINING INVESTMENT PLATFORM



Act as a senior full-stack engineer, UI/UX designer, database architect, and security engineer.



Upgrade my existing GitHub-connected project into a professional Bitcoin mining investment platform. Do not create a new project, replace the existing application unnecessarily, or remove working features.



First inspect the complete existing codebase, framework, routes, components, authentication, database integrations, environment configuration, and GitHub repository structure. Then implement the changes directly in the existing project.



The final product must be a polished, responsive, Arabic-first investment platform with a premium visual design, an interactive profit calculator available before registration, user accounts, a referral program, cryptocurrency deposit and withdrawal workflows, mining revenue records, and a secure administrator dashboard.



Do not claim that a feature works unless it has actually been implemented and tested.



1. Technology and Project Requirements



- Preserve the current framework and working architecture whenever practical.

- Use the existing GitHub repository and maintain compatibility with its current branch and build configuration.

- If Supabase is already integrated, reuse it. If it is not connected, prepare the integration cleanly and document the required setup without inventing credentials.

- Use TypeScript and the existing UI framework where applicable.

- Use reusable components and maintainable code.

- Implement server-side validation for all sensitive operations.

- Use environment variables for secrets and private API credentials.

- Do not expose private keys, service-role keys, wallet signing keys, or payment-provider secrets in frontend code.

- Do not introduce unnecessary paid services or dependencies.

- Keep the application deployable using the project's existing hosting configuration.



2. Brand Identity and Visual Design



Create a premium financial technology design with the following characteristics:



- Brand name: Bitcoin Mining Investment. Keep the brand name configurable.

- Default language: Arabic.

- Full right-to-left layout for Arabic.

- Optional English language with a proper left-to-right layout.

- Deep navy and black backgrounds with elegant Bitcoin-gold accents.

- High-quality mining hardware and data-center imagery.

- Clear typography, balanced spacing, polished cards, subtle shadows, and smooth transitions.

- Responsive layouts for mobile phones, tablets, laptops, and desktop screens.

- Strong visual hierarchy and accessible color contrast.

- Distinct primary and secondary buttons.

- Proper loading, success, empty, validation, and error states.

- Consistent icons, navigation, forms, tables, and dialogs.



Do not use fake testimonials, fake transaction histories, fabricated mining statistics, or unverified licensing badges.



3. Public Landing Page



Build a professional landing page that visitors can explore before creating an account.



Navigation



Include:



- Logo and brand name.

- Home.

- How Mining Works.

- Profit Calculator.

- Investment Information.

- Referral Program.

- FAQ.

- Login.

- Create Account.

- Language selector.



The navigation must work on both desktop and mobile.



Hero Section



Use this headline:



"Explore Bitcoin Mining Investment"



Arabic headline:



"اكتشف عالم الاستثمار في تعدين البيتكوين"



Supporting text:



"Explore Bitcoin mining, calculate an illustrative investment scenario, and review the platform's mining operations, fees, and terms before creating an account."



Arabic supporting text:



"تعرّف على تعدين البيتكوين، واحسب العائد التقديري لاستثمارك، واطّلع على آلية التشغيل والرسوم والشروط قبل إنشاء حساب."



Primary CTA: Calculate Your Profit.



Secondary CTA: Create Your Account.



Third CTA: How Mining Works.



Use a visually striking mining-facility background with a readable dark overlay. Ensure the headline, description, and buttons remain clearly visible.



Features Section



Create attractive cards for:



- Bitcoin Mining Operations.

- Mining Revenue Reporting.

- Investment Tracking.

- Secure Account Access.

- Cryptocurrency Deposits.

- Referral Rewards.

- Transaction History.

- Customer Support.



Only present capabilities as operational when they have actually been implemented and verified.



4. Interactive Profit Calculator — Available Before Registration



This feature is mandatory.



Visitors must be able to calculate an illustrative return without creating an account.



Inputs



- Investment amount in USD.

- Minimum initial amount: $10.

- Editable investment amount.

- Optional duration selector: 1, 3, 6, or 12 months.

- Default illustrative monthly rate: 1%.

- Display the selected rate and calculation assumptions clearly.



The administrator must be able to change the illustrative rate through a secure settings interface.



Calculation Method



Use simple, non-compounding interest by default.



"monthlyRate = 0.01"



"estimatedProfit = investmentAmount × monthlyRate × numberOfMonths"



"estimatedTotal = investmentAmount + estimatedProfit"



For a $10 investment over one month:



- Initial amount: $10.00.

- Illustrative monthly return: $0.10.

- Illustrative total: $10.10.



For a $100 investment over one month:



- Initial amount: $100.00.

- Illustrative monthly return: $1.00.

- Illustrative total: $101.00.



For a $100 investment over three months using simple interest:



- Initial amount: $100.00.

- Illustrative total return: $3.00.

- Illustrative total: $103.00.



Update the displayed results immediately when the visitor changes the amount, rate, or duration.



Use precise decimal arithmetic for monetary calculations. Validate inputs, reject negative values, prevent invalid or excessively large values, and format USD amounts consistently to two decimal places.



Calculator Results



Display three prominent cards:



1. Initial Investment.

2. Illustrative Estimated Profit.

3. Illustrative Estimated Total.



Below the results, include this notice:



"Illustrative calculation only. The selected monthly rate is an assumption, not a guaranteed return. Actual mining revenue depends on verified operating performance, mining difficulty, Bitcoin market prices, electricity, maintenance, fees, and other costs. Actual distributions may be lower or zero, and capital may be at risk."



Provide an Arabic translation of the notice.



Add a prominent button:



"Create an Account to Get Started"



The button must navigate to the registration page.



Important: The 1% rate is a calculator assumption. Do not automatically credit 1% to user accounts or label estimated returns as realized mining profits. Any actual distribution must follow the platform's documented business model and verified financial records.



5. User Registration and Authentication



Implement complete authentication using the existing authentication provider.



Registration fields:



- Full name.

- Email address.

- Password.

- Password confirmation when appropriate.

- Optional referral code.

- Required acceptance of the Terms of Service and Privacy Policy.



Login fields:



- Email address.

- Password.

- Password visibility toggle.

- Forgot Password.

- Clear validation messages.

- Loading and error states.



Requirements:



- Secure password handling through the authentication provider.

- Email verification where configured.

- Secure session handling.

- Protected user routes.

- Proper logout functionality.

- Password reset flow.

- Duplicate account prevention.

- Rate limiting and appropriate abuse protection.

- No plain-text password storage.

- No fabricated successful authentication states.



After successful login, redirect the user to the dashboard.



6. User Dashboard



Create a premium Arabic-first dashboard with these sections:



Account Overview



Display:



- Total confirmed deposits.

- Available balance.

- Pending deposits.

- Pending withdrawals.

- Active investments, if supported by the actual business model.

- Realized mining distributions.

- Estimated returns, shown separately.

- Referral commissions.

- Account verification status.



Additional Pages



- My Account.

- Investment Details.

- Mining Revenue Reports.

- Deposit History.

- Withdrawal History.

- Referral Program.

- Transaction History.

- Security Settings.

- Notifications.

- Customer Support.



All displayed balances must come from trusted database records, not hardcoded frontend values.



Never mix test balances with real funds. Clearly identify any sandbox or demonstration environment.



7. Bitcoin and USDT Deposit System



Prepare a secure cryptocurrency payment architecture for BTC and USDT.



The deposit interface must support Bitcoin and only the USDT networks that have been explicitly configured and verified by the administrator.



Do not assume all USDT networks are interchangeable.



Deposit Flow



1. The user opens the Deposit page.

2. The user selects Bitcoin or USDT.

3. For USDT, the user selects an enabled blockchain network.

4. The user enters the deposit amount.

5. The server creates a unique deposit record and payment reference.

6. The interface displays the correct receiving address and network instructions.

7. The user sends the funds.

8. The system verifies the transaction using a trusted blockchain data provider, a properly configured node, or a secure payment processor.

9. The system checks the asset, network, destination address, amount, transaction identifier, and required confirmation status.

10. The deposit becomes confirmed only after the verification rules are satisfied.

11. A trusted backend operation records the confirmed deposit and updates the internal ledger exactly once.



Deposit Statuses



Use explicit states such as:



- Created.

- Awaiting Payment.

- Detected.

- Confirming.

- Confirmed.

- Rejected.

- Expired.



Prevent duplicate transaction processing and double crediting. Make deposit processing idempotent.



Do not mark a deposit as successful merely because the user submits a transaction hash or uploads a screenshot.



Do not display fake wallet addresses. Do not create a production payment flow until the receiving addresses and verification provider have been configured and tested.



Payment Integration Architecture



Create a provider-independent payment interface so the platform can support a verified blockchain API, a self-hosted node, or a compatible payment gateway later.



Keep provider credentials on the server. Validate incoming webhooks, authenticate requests, and reject duplicate or forged notifications.



If a fully automated integration cannot be completed without credentials or infrastructure, implement the safe interface, database schema, server-side service boundary, and setup instructions. Clearly identify what remains unconfigured.



8. Withdrawal System



Implement a secure withdrawal request workflow.



Required fields:



- Asset.

- Supported network.

- Destination wallet address.

- Amount.

- Fee estimate.

- Final confirmation.



The system must:



- Validate available balance.

- Validate the asset and network combination.

- Apply configured minimums and fees.

- Prevent withdrawals exceeding the available balance.

- Reserve funds atomically when a withdrawal request is accepted.

- Prevent duplicate requests and double spending.

- Require appropriate administrative or automated authorization before broadcasting a transaction.

- Record the transaction hash after successful broadcasting.

- Display clear statuses and timestamps.



Never store wallet private keys in the frontend or expose signing credentials to users. Use a properly secured wallet infrastructure or payment provider for actual payouts.



9. Referral Program — 1% Commission



Implement a single-level referral program.



Every user receives a unique referral code and shareable referral URL.



The referral page must display:



- Referral URL.

- Copy Link button.

- Total referred registrations.

- Eligible referrals.

- Eligible investment volume.

- Pending commissions.

- Approved commissions.

- Paid commissions.

- Referral transaction history.



Commission Rules



Default commission rate: 1%.



Calculate the commission once on the eligible, confirmed investment principal of a directly referred customer, according to the published program terms.



Example:



Eligible confirmed investment: $100.00



Referral rate: 1%



Commission: $1.00



Do not calculate commissions on unconfirmed deposits, simulated investments, unrealized returns, or repeated processing of the same investment.



Requirements:



- One-level referrals only.

- No self-referrals.

- Prevent duplicate commission records.

- Store the applicable rate and calculation basis with each commission record.

- Use a trusted server-side calculation.

- Track pending, approved, and paid states.

- Define how refunds, reversed deposits, fraud, and withdrawals affect eligibility.

- Do not allow users to edit their own commission rates.

- Make the program's terms visible before users participate.



Only approve and pay commissions when the platform has sufficient legitimate funds and the program complies with applicable laws.



10. Mining Operations and Revenue Accounting



The platform represents a real mining operation, so provide an operational data model rather than fabricated mining activity.



Create an administration section for recording or importing verified mining information, including:



- Mining equipment inventory.

- Equipment status.

- Hash rate and uptime, where measurable.

- Mining pool or mining provider records.

- BTC mined during a reporting period.

- Mining pool fees.

- Electricity costs.

- Maintenance expenses.

- Other operating expenses.

- BTC/USD valuation and the valuation timestamp.

- Net mining revenue.

- Distribution records and reporting periods.



Support importing reports from mining pools or other verified data sources when available.



Keep gross mining revenue, operating costs, net revenue, user allocations, and actual distributions separate.



Do not automatically distribute a fixed 1% monthly return if actual revenue, the investment agreement, and available funds do not support it.



The 1% calculator assumption must remain distinct from the accounting and distribution engine.



If mining data has not been connected, display a clear setup status instead of inventing operational metrics.



11. Administrator Dashboard



Create a protected administrator dashboard.



Sections:



- Platform Overview.

- Users and Account Status.

- Deposit Requests.

- Withdrawal Requests.

- Investment Records.

- Mining Equipment.

- Mining Revenue.

- Operating Expenses.

- Referral Commissions.

- Supported Assets and Networks.

- Wallet Address Configuration.

- Payment Provider Settings.

- Profit Calculator Settings.

- Fees and Limits.

- Notifications.

- Audit Logs.

- Security and System Health.



The administrator must be able to:



- Change the calculator's illustrative monthly rate.

- Enable or disable supported assets and networks.

- Configure deposit addresses and verification requirements.

- Review deposit and withdrawal records.

- Review mining data and operating expenses.

- Review and approve eligible referral commissions.

- View transaction and audit histories.

- Manage users using controlled permissions.



Protect administrative operations with server-side authorization and database policies. Do not rely on hidden frontend buttons as an access-control mechanism.



Require appropriate additional verification for sensitive administrative or financial actions.



Record who performed each sensitive action, when it occurred, and what changed.



12. Database and Financial Integrity



Reuse the existing database if suitable. If Supabase is used, create version-controlled SQL migrations and appropriate Row Level Security policies.



Review and create the necessary tables, such as:



- profiles

- user_roles

- investment_plans

- investments

- deposits

- withdrawals

- ledger_accounts

- ledger_entries

- transactions

- referral_codes

- referrals

- referral_commissions

- mining_equipment

- mining_reports

- mining_expenses

- revenue_distributions

- notifications

- site_settings

- audit_logs



Adapt the schema to the actual business model. Do not create redundant tables or break existing migrations.



Financial integrity requirements



- Store monetary values using exact decimal types or integer units appropriate to each asset.

- Respect Bitcoin and supported token precision.

- Never use ordinary floating-point arithmetic for authoritative financial ledger calculations.

- Record timestamps in a consistent format.

- Use unique transaction identifiers where available.

- Implement atomic ledger operations.

- Keep an immutable or appropriately protected financial audit trail.

- Prevent negative available balances.

- Prevent duplicate deposit credits and commission payments.

- Use database constraints and server-side validation.

- Implement Row Level Security so users can access only their own permitted data.

- Restrict privileged operations to trusted backend services.



Never allow a user to directly edit their own balance, confirmed deposit, realized profit, or commission payment status.



13. Security, Privacy, and Compliance



Implement:



- Secure authentication and authorization.

- Input validation.

- Rate limiting where supported.

- Protection against duplicate requests.

- Safe error handling.

- Secret management.

- Database access controls.

- Audit logging.

- Appropriate privacy controls.

- Secure handling of identity verification documents if required.

- Clear risk disclosures and terms.



Provide configurable settings for supported jurisdictions, eligibility requirements, and applicable verification procedures.



Do not claim that the platform is licensed, audited, compliant, or legally approved unless that status has been independently verified.



Do not enable public deposits or real-money investment functionality until the necessary legal, operational, payment, and security requirements have been checked for the intended markets.



14. Public Information Pages



Create polished pages for:



- How Bitcoin Mining Works.

- Mining Operations.

- Profit Calculator.

- Investment Terms.

- Risk Disclosure.

- Fees and Withdrawal Policy.

- Referral Terms.

- Privacy Policy.

- Terms of Service.

- Frequently Asked Questions.

- Contact and Support.



Explain that mining revenue can fluctuate and that users may lose money. Describe the actual operating model and the conditions for any distributions.



Do not make misleading guarantees about profits, principal protection, or withdrawal availability.



15. Quality Assurance and Acceptance Tests



After implementation, run the available build, lint, type-check, database, and test commands.



Verify the following:



1. The existing project still builds.

2. The landing page is responsive and visually consistent.

3. Arabic RTL and English LTR layouts work correctly.

4. The calculator works without registration.

5. A $10 investment at an illustrative 1% monthly rate produces a $0.10 simple-interest estimate for one month.

6. A $100 investment at the same rate produces a $1.00 one-month estimate.

7. A $100 investment for three months produces a $3.00 simple-interest estimate.

8. Registration, login, logout, and password recovery work with the configured authentication provider.

9. Referral attribution is preserved correctly.

10. A $100 eligible investment produces a $1 referral commission at the configured 1% rate, exactly once.

11. Users cannot access other users' private financial records.

12. Deposits are not credited before required verification.

13. Duplicate blockchain events cannot credit funds twice.

14. Withdrawals cannot exceed the available balance.

15. Administrative routes and actions enforce authorization.

16. The interface clearly distinguishes estimates from realized revenue.

17. No fake payment success, fabricated balances, or unverified mining statistics are present.

18. All buttons and links have meaningful actions.

19. Errors are handled gracefully.

20. All remaining infrastructure or configuration requirements are documented.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3e1c11b-ba34-40f4-8ef8-e37a9633f31b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
