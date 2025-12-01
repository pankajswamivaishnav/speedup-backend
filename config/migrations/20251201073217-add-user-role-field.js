module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   */
  async up(db, client) {
    // Rename fields in your collection
    await db.collection("Transporter").updateMany(
      {},
      {
        $rename: {
          transporter_first_name: "first_name",
          transporter_last_name: "last_name",
        },
      }
    );
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   */
  async down(db, client) {
    // Revert the field name changes (rollback)
    await db.collection("Transporter").updateMany(
      {},
      {
        $rename: {
          first_name: "transporter_first_name",
          last_name: "transporter_last_name",
        },
      }
    );
  },
};
