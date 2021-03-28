export default function versioner(schema) {
  if (schema.$implicitlyCreated) {
    // Implicit creation mean that it's an internal model, aka subdocument.
    // In this case, we don't want to add hooks, because methods are not existing and it's not relevant.
    return;
  }
  // Get version key name
  const versionKey = schema.get("versionKey");

  // Add pre-save hook to check version
  schema.pre("save", function handler(next) {
    this.$where = {
      ...this.$where,
      [versionKey]: this[versionKey],
    };
    this.increment();
    next();
  });

  schema.pre("findOneAndUpdate", function handler(next) {
    if (typeof this._update?.$setOnInsert?.__v === undefined) {
      this.update({}, { $inc: { __v: 1 } }, next);
    }
    next();
  });
}
