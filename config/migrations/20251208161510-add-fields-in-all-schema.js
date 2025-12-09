module.exports = {
  async up(db, client) {
    const collections = ["transporters", "users", "drivers", "vendors"];

    for (const name of collections) {
      const collection = db.collection(name);

      console.log(`Updating collection: ${name}`);

      // Add isVerified if missing
      await collection.updateMany(
        { isVerified: { $exists: false } },
        { $set: { isVerified: false } }
      );

      // Add isPremium if missing
      await collection.updateMany(
        { isPremium: { $exists: false } },
        { $set: { isPremium: false } }
      );

      console.log(`✔ Updated: ${name}`);
    }
  },

  async down(db, client) {
    const collections = ["transporters", "users", "drivers", "vendors"];

    for (const name of collections) {
      const collection = db.collection(name);

      console.log(`Reverting changes in: ${name}`);

      await collection.updateMany(
        {},
        { $unset: { isVerified: "", isPremium: "" } }
      );

      console.log(`✔ Reverted: ${name}`);
    }
  },
};
