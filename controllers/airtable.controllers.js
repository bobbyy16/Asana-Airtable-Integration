const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_ID;
const access_token = process.env.AIRTABLE_API_KEY;

const addTask = async (req, res) => {
  const { Name, Assignee, Description, ID, Deadline } = req.body;

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Name,
          Assignee,
          Description,
          ID,
          Deadline,
        },
      }),
    });

    if (!response) {
      throw new Error("No response received from Airtable");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error adding task to Airtable: ${errorText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error adding data to Airtable", error);
    throw error;
  }
};
const deleteTask = async (req, res) => {
  const { ID: taskID } = req.body;

  // Construct the Airtable API URL to fetch records
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  try {
    // Fetch records from Airtable
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching records from Airtable: ${errorText}`);
    }

    const { records } = await response.json();

    // Find the record with the matching ID
    const recordToDelete = records.find(
      (record) => record.fields.ID === taskID
    );

    if (!recordToDelete) {
      console.error(`Task with ID ${taskID} not found in Airtable`);
      return res
        .status(404)
        .json({ error: `Task with ID ${taskID} not found in Airtable` });
    }

    // Extract view ID from the record (assuming view ID is stored in a field named 'ViewID')
    const viewID = recordToDelete.fields.ViewID;

    // Delete the record using the view ID
    const deleteURL = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordToDelete.id}?view=${viewID}`;
    const deleteResponse = await fetch(deleteURL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Error deleting task from Airtable: ${errorText}`);
    }

    return res.status(204).end(); // Sending status 204 for no content
  } catch (error) {
    console.error(`Error deleting task from Airtable for ID ${taskID}`, error);
  }
};

const editTask = async (req, res) => {
  const { ID: taskID, Name, Assignee, Description, Deadline } = req.body; // Extract variables from req.body

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching records from Airtable: ${await response.text()}`
      );
    }

    const { records } = await response.json();

    const recordToEdit = records.find((record) => record.fields.ID === taskID);

    if (!recordToEdit) {
      console.error(`Task with ID ${taskID} not found in Airtable`);
      return res
        .status(404)
        .json({ error: `Task with ID ${taskID} not found in Airtable` });
    }

    const viewID = recordToEdit.fields.viewID;

    const editUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${recordToEdit.id}?view=${viewID}`; // Corrected variable name

    const editResponse = await fetch(editUrl, {
      method: "PATCH", // Changed method to PATCH for updating records
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json", // Added Content-Type header
      },
      body: JSON.stringify({
        fields: {
          Name,
          Assignee,
          Description,
          Deadline,
        },
      }),
    });

    if (!editResponse.ok) {
      throw new Error(
        `Error updating task in Airtable: ${await editResponse.text()}`
      );
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Error editing task in Airtable", error);
    return res.status(500).json({ error: "Internal server error" }); // Return appropriate error response
  }
};

module.exports = {
  addTask,
  deleteTask,
  editTask,
};
