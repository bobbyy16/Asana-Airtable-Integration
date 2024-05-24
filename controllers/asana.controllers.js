const crypto = require("crypto");
const axios = require("axios");
const { addTask, deleteTask, editTask } = require("./airtable.controllers.js");
let secret = "";

// In-memory set for locking mechanism
const processingTasks = new Set();

const receiveWebhooks = async (req, res) => {
  if (req.headers["x-hook-secret"]) {
    secret = req.headers["x-hook-secret"];
    res.setHeader("X-Hook-Secret", secret);
    console.log(`${secret} is here`);
    return res.sendStatus(200);
  }

  if (req.headers["x-hook-signature"]) {
    const computedSignature = crypto
      .createHmac("SHA256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(req.headers["x-hook-signature"]),
        Buffer.from(computedSignature)
      )
    ) {
      return res.sendStatus(401);
    }

    res.sendStatus(200); // Respond to acknowledge receipt of the webhook

    const events = req.body?.events || [];
    for (const event of events) {
      const { action, resource, parent } = event;
      const { gid } = resource;

      console.log(`Processing event: ${action} for task ID: ${gid}`);

      // Check if task is already being processed
      if (processingTasks.has(gid)) {
        console.log(`Task ID ${gid} is already being processed. Skipping.`);
        continue;
      }

      // Add task ID to processing set
      processingTasks.add(gid);

      try {
        switch (action) {
          case "added":
            if (
              parent.resource_type === "section" &&
              resource.resource_type === "task"
            ) {
              if (!gid) {
                throw new Error("Task ID is required");
              }

              const accessToken = process.env.ASANA_PAT;

              setTimeout(async () => {
                try {
                  const taskResponse = await axios.get(
                    `https://app.asana.com/api/1.0/tasks/${gid}`,
                    {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                      },
                    }
                  );

                  const taskDetails = taskResponse?.data?.data;

                  const taskData = {
                    Name: taskDetails?.name || "No name provided",
                    Description: taskDetails?.notes?.trim() || "No description",
                    Assignee: taskDetails?.assignee?.name || "Unassigned",
                    Deadline: taskDetails?.due_on || "No due date specified",
                    ID: gid,
                  };

                  if (!taskData.Name) {
                    throw new Error("Name is required");
                  }

                  console.log("Task data to be added to Airtable:", taskData);
                  await addTask({ body: taskData });
                } catch (error) {
                  console.error(`Error processing task with ID ${gid}`, error);
                } finally {
                  // Remove task ID from processing set
                  processingTasks.delete(gid);
                }
              }, 15000);
            } else {
              console.warn(`Unhandled event action: ${action}`);
              processingTasks.delete(gid);
            }
            break;

          case "deleted":
            if (!gid) {
              throw new Error("Task ID is required");
            }

            console.log(`Task with ID ${gid} has been deleted.`);

            try {
              // Call deleteTask function with the task ID
              await deleteTask({ body: { ID: gid } });
              console.log(`Task with ID ${gid} deleted from Airtable.`);
            } catch (error) {
              console.error(
                `Error deleting task from Airtable for ID ${gid}`,
                error
              );
            }
            break;

          case "changed":
            if (!gid) {
              throw new Error("Task ID is required");
            }

            const accessToken = process.env.ASANA_PAT;

            setTimeout(async () => {
              try {
                const taskResponse = await axios.get(
                  `https://app.asana.com/api/1.0/tasks/${gid}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  }
                );

                const taskDetails = taskResponse?.data?.data;

                const taskData = {
                  Name: taskDetails?.name || "No name provided",
                  Description: taskDetails?.notes?.trim() || "No description",
                  Assignee: taskDetails?.assignee?.name || "Unassigned",
                  Deadline: taskDetails?.due_on || "No due date specified",
                  ID: gid,
                };

                if (!taskData.Name) {
                  throw new Error("Name is required");
                }
                console.log("Task data to be updated in Airtable:", taskData);
                await editTask({ body: taskData });
              } catch (error) {
                console.error(`Error processing task with ID ${gid}`, error);
              } finally {
                // Remove task ID from processing set
                processingTasks.delete(gid);
              }
            }, 10000);
            break;

          default:
            console.warn(`Unhandled event action: ${action}`);
            processingTasks.delete(gid);
        }
      } catch (error) {
        console.error(`Error processing event: ${action}`, error);
        processingTasks.delete(gid); // Ensure task is removed from the set on error
      }
    }
  } else {
    console.error("Invalid webhook request");
    res.sendStatus(400);
  }
};

module.exports = { receiveWebhooks };
