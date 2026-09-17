exports.up = (pgm) => {
  pgm.createTable('counters', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(200)', notNull: true, unique: true },
    value: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('counters');
};
