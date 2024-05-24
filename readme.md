## Webhooks Processor: Automate Asana Task Management with Airtable

This Node.js application bridges the gap between Asana and Airtable, enabling seamless synchronization of task events. It listens for incoming webhooks from Asana, processes task updates (adding, deleting, or modifying), retrieves detailed task information using Asana's API, and keeps your Airtable base in sync.
[Demo Video](https://www.loom.com/share/44477fe546044e56b435a6ad8f1dfb68?sid=ebf8b3e2-e861-4c91-a2af-117a52e9a0ce)

## Prerequisites:

1. Node.js and npm (or yarn) are installed on your system.
2. Asana account with a Personal Access Token (PAT) generated.
3. Airtable account with a base and table structure designed to accommodate
   your Asana tasks.

## Setup:

### Clone the Repository:

```
git clone https://github.com/yourusername/your-repository.git
```

### Change Directory:

```
cd your-repository
```

### Install Dependencies:

```
npm install
```

### Set Up Environment Variables:

Create a .env file in the project's root directory and populate it with the following variables:

```
ASANA_PAT=your_asana_personal_access_token
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
AIRTABLE_TABLE_NAME=your_airtable_table_name
```

Replace your_asana_personal_access_token with your actual Asana PAT.

Obtain your Airtable API key, base ID, and table name from your Airtable account settings.

## Running the Application:

Start the application by running:

```
npm start
```

This will initiate the server, listening for incoming Asana webhooks. Ensure your server is publicly accessible for Asana to deliver webhooks.

# Webhooks Processor

## Functionality:

**receiveWebhooks Function:** This serves as the core event handler for incoming Asana webhooks. It performs the following crucial tasks:

**Webhook Signature Verification:** Validates the webhook's authenticity using HMAC signatures.

**Event Processing:** Determines the specific task event (adding, deleting, or modifying) and takes appropriate actions.

**Task Detail Retrieval:** Fetches detailed information about the relevant task by interacting with Asana's API.

**Airtable Synchronization:** Updates your Airtable base with the retrieved task details, ensuring consistency between Asana and Airtable.

**Locking Mechanism:** Employs an in-memory set (processingTasks) to prevent redundant processing of concurrently arriving task updates.

## Additional Considerations:

- **Error Handling:** Implement robust error handling for unexpected issues and logging for debugging.
- **Security:** Securely store Asana PAT and Airtable API key using environment variables.
- **Logging:** Incorporate logging for monitoring and troubleshooting.
- **Scalability:** Consider scalability options for handling high volumes of task events, like a distributed queueing system.
