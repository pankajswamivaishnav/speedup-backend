const mongoose = require("mongoose");
module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   */
  async up(db, client) {
    // 🔴 CHANGE THIS to your real collection name
    const collection = db.collection("transporters");

    // This will:
    // - set first_name from transporter_first_name if first_name is missing
    // - set last_name from transporter_last_name if last_name is missing
    // - then remove old fields
    await collection.updateMany(
      {
        $or: [
          { transporter_first_name: { $exists: true } },
          { transporter_last_name: { $exists: true } },
        ],
      },
      [
        {
          $set: {
            first_name: {
              $ifNull: ["$first_name", "$transporter_first_name"],
            },
            last_name: {
              $ifNull: ["$last_name", "$transporter_last_name"],
            },
          },
        },
        {
          $unset: ["transporter_first_name", "transporter_last_name"],
        },
      ]
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   */
  async down(db, client) {
    // 🔴 CHANGE THIS to your real collection name
    const collection = db.collection("transporters");

    // Rollback: move values back to transporter_* and remove new fields
    await collection.updateMany(
      {
        $or: [
          { first_name: { $exists: true } },
          { last_name: { $exists: true } },
        ],
      },
      [
        {
          $set: {
            transporter_first_name: {
              $ifNull: ["$transporter_first_name", "$first_name"],
            },
            transporter_last_name: {
              $ifNull: ["$transporter_last_name", "$last_name"],
            },
          },
        },
        {
          $unset: ["first_name", "last_name"],
        },
      ]
    );
  },
};
