# Website Attribution Agent

The **Website Attribution Agent** leverages the **Supra-L1-SDK** to create a decentralized website attribution system that tracks conversions and automatically processes Supra payouts. It enables website owners to register their domains with the agent, verify ownership, track conversions, and receive automated micropayments for successful referrals.

## **Run the Agent**

``// Navigate into the agent directory to run this agent``

```bash
cd Agents
cd WebsiteAttributionAgent
```

### **2️⃣ Install Dependencies**

```bash
npm install
```

### **3️⃣ Run the AI Agent**
Simply execute:

```bash
npx ts-node agent.ts
```

## **Running the Agent!**
Once running, you can enter conversational commands like:

```bash
npx ts-node agent.ts
```

*** Welcome to Website Attribution Agent ***

Initializing Supra Client...
Connected to network with chain ID: _ChainId { value: 6 }
Your Supra Account Address: 
0x26b58..........a9548c218d

Available commands:
 - 'register my website example.com'           : Register a new website for attribution tracking
 - 'verify ownership of website <WEBSITE_ID>'  : Verify domain ownership
 - 'track conversion for website <WEBSITE_ID>' : Record a conversion event by website ID
 - 'track conversion for example.com'          : Record a conversion event by domain (auto-creates if needed)
 - 'show stats for website <WEBSITE_ID>'       : Display website analytics
 - 'show all conversions'                      : View conversion history
 - 'show pending payouts'                      : View escrow funds awaiting verification
 - 'help'                                      : Show this help message
 - 'exit'                                      : Quit the agent

Website Attribution Agent> 
```

**The agent processes your request and interacts with the Supra blockchain to manage website attribution and payouts in real time.**

## **Example Workflows**

### **Standard Workflow (Verified Website)**
1. **Register Website**: `register my website example.com`
2. **Get Verification Instructions**: Follow the provided instructions to add verification token
3. **Verify Ownership**: `verify ownership of website abc123`
4. **Track Conversions**: When sales occur, track them with conversion data
5. **Receive Payouts**: Automatic pyUSD payments for each tracked conversion

### **Universal Escrow Workflow (ANY Website)**
1. **Track Conversions for ANY Domain**: `track conversion for randomwebsite.com`
2. **Auto-Create Placeholder**: System automatically creates temporary website registration
3. **Funds Held in Escrow**: Payouts are held securely until owner claims them
4. **Website Owner Discovers Funds**: Owner registers domain and finds pending payouts waiting
5. **Verify & Claim**: `verify ownership of website abc123` to claim all accumulated funds

### **Third-Party Attribution**
- **Track ANY Website**: Anyone can track conversions for any domain
- **Automatic Placeholders**: System creates temporary registrations for unregistered domains
- **Owner Discovery**: Website owners can register later and discover accumulated payouts
- **Viral Growth**: Drives adoption as website owners discover unexpected earnings

### **Persistent Storage**
- **Remembers Websites**: Already registered websites are loaded from `websites.json`
- **Avoids Duplicates**: Re-registering a domain returns existing website ID
- **Preserves Escrow**: Pending payouts persist across agent restarts

🔥Let's Build Attribution Systems ON Supra L1. 