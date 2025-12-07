const mongoose = require("mongoose");

module.exports = {
  async up(db, client) {
    const collection = db.collection("Transporter");

    console.log("Step 1: Copy old fields → new fields");

    // Step 1: Copy old values into new fields
    await collection.updateMany(
      { transporter_first_name: { $exists: true } },
      {
        $set: {
          first_name: { $ifNull: ["$first_name", "$transporter_first_name"] },
        },
      }
    );

    await collection.updateMany(
      { transporter_last_name: { $exists: true } },
      {
        $set: {
          last_name: { $ifNull: ["$last_name", "$transporter_last_name"] },
        },
      }
    );

    console.log("Step 2: Remove old fields");

    // Step 2: Remove old fields
    await collection.updateMany(
      {},
      {
        $unset: {
          transporter_first_name: "",
          transporter_last_name: "",
        },
      }
    );
  },

  async down(db, client) {
    const collection = db.collection("Transporter");

    console.log("Rollback: Copy new fields → old fields");

    await collection.updateMany(
      { first_name: { $exists: true } },
      {
        $set: {
          transporter_first_name: {
            $ifNull: ["$transporter_first_name", "$first_name"],
          },
        },
      }
    );

    await collection.updateMany(
      { last_name: { $exists: true } },
      {
        $set: {
          transporter_last_name: {
            $ifNull: ["$transporter_last_name", "$last_name"],
          },
        },
      }
    );

    console.log("Rollback: Remove new fields");

    await collection.updateMany(
      {},
      {
        $unset: {
          first_name: "",
          last_name: "",
        },
      }
    );
  },
};
